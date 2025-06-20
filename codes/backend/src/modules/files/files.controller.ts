import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { Request, Response } from "express";
import { promises as fsPromises } from "fs";
import * as path from "path";
import { File } from "../../common/enums/logging-tag.enum";
import { IControllerResult } from "../../common/interfaces/controller-result.interface";
import { fileUploadToDisk } from "../../common/utils/file-upload";
import { CustomLogger } from "../../shared/services/custom-logger.service";
import { FilesService } from "./services/files.service";

@Controller({ path: "files", version: "v1" })
@ApiTags("Files")
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly logger: CustomLogger
  ) {
    logger.setContext(FilesController.name);
  }

  @Post()
  @ApiOperation({ summary: "Upload a file" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor("file", fileUploadToDisk()))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request
  ): Promise<IControllerResult> {
    this.logger.log(File.UPLOAD_FILE, "Upload file request initialized");

    if (!file) {
      throw new BadRequestException("File is required");
    }

    const { publicKey, privateKey } = await this.filesService.saveFile(
      file,
      req.ip
    );

    return {
      message: "File uploaded successfully",
      data: { publicKey, privateKey },
    };
  }

  @Get(":publicKey")
  @ApiOperation({ summary: "Download a file by public key" })
  @ApiParam({
    name: "publicKey",
    description: "Public key associated with the uploaded file",
    type: String,
  })
  @ApiOkResponse({
    description: "The file will be returned as a downloadable stream",
    content: {
      "application/octet-stream": {
        schema: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "Custom 404 error when file is not found",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "failed" },
        code: { type: "integer", example: 404 },
        reason: { type: "string", example: "File not found" },
        message: { type: "string", example: "File not found" },
      },
    },
  })
  async download(
    @Param("publicKey") publicKey: string,
    @Res() res: Response,
    @Req() req: Request
  ): Promise<void> {
    this.logger.log(File.DOWNLOAD_FILE, "Download file request initialized", {
      publicKey,
    });

    let file;
    try {
      file = await this.filesService.getFileByPublicKey(publicKey);
    } catch (error) {
      this.logger.error(
        File.DOWNLOAD_FILE,
        `Error retrieving file: ${publicKey}`,
        error
      );
      throw new InternalServerErrorException("Failed to retrieve file");
    }

    if (!file) {
      throw new NotFoundException("File not found");
    }

    // Normalize and validate the file path for security
    const normalizedPath = path.normalize(file.path);
    const resolvedPath = path.resolve(normalizedPath);
    try {
      // Verify file exists using async call
      await fsPromises.access(resolvedPath);

      // Update the IP usage in the database
      this.filesService.updateIpUsage(req.ip, file.size, false);

      // Set response headers
      res.set({
        "Content-Type": file.mimetype,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(file.filename)}"`,
        "Content-Length": file.size,
      });

      // Stream the file to the response
      const { createReadStream } = await import("fs");
      const fileStream = createReadStream(resolvedPath);

      // Handle stream errors
      fileStream.on("error", (err) => {
        this.logger.error(
          File.DOWNLOAD_FILE,
          `Error streaming file: ${resolvedPath}`,
          err
        );
        // Only send error if headers haven't been sent
        if (!res.headersSent) {
          res.status(500).json({
            status: "failed",
            code: 500,
            message: "Error streaming file",
          });
        } else {
          res.end();
        }
      });

      // Handle request close/abort to clean up resources
      req.on("close", () => {
        fileStream.destroy();
      });

      // Pipe stream to response
      fileStream.pipe(res);
    } catch (error) {
      if (error.code === "ENOENT") {
        this.logger.log(
          File.DOWNLOAD_FILE,
          `File not found on disk: ${resolvedPath}`
        );
        throw new NotFoundException("File not found on disk");
      } else {
        this.logger.error(
          File.DOWNLOAD_FILE,
          `Error accessing file: ${resolvedPath}`,
          error
        );
        throw new InternalServerErrorException("Failed to access file");
      }
    }
  }

  @Delete(":privateKey")
  @ApiNotFoundResponse({
    description: "Custom 404 error when file is not found",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "failed" },
        code: { type: "integer", example: 404 },
        reason: { type: "string", example: "File not found" },
        message: { type: "string", example: "File not found" },
      },
    },
  })
  async remove(
    @Param("privateKey") privateKey: string
  ): Promise<IControllerResult> {
    this.logger.log(File.DELETE_FILE, "Delete file request initialized", {
      privateKey,
    });

    try {
      // Check if the file exists and delete it
      const deleted =
        await this.filesService.deleteFileByPrivateKey(privateKey);
      if (!deleted) {
        throw new NotFoundException("File not found");
      }

      return { message: "File deleted successfully" };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        File.DELETE_FILE,
        `Error deleting file with privateKey: ${privateKey}`,
        error
      );
      throw new InternalServerErrorException("Failed to delete file");
    }
  }
}
