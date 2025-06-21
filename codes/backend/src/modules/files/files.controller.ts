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
import { File } from "../../common/enums/logging-tag.enum";
import { IControllerResult } from "../../common/interfaces/controller-result.interface";
import { fileUploadToDisk } from "../../common/utils/file-upload";
import { CustomLogger } from "../../shared/services/custom-logger.service";
import { StorageService } from "../storage/storage.service";
import { FilesService } from "./services/files.service";

@Controller({ path: "files", version: "v1" })
@ApiTags("Files")
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly storageService: StorageService,
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

    try {
      // Get file metadata from database
      const fileMetadata =
        await this.filesService.getFileByPublicKey(publicKey);

      if (!fileMetadata) {
        throw new NotFoundException("File not found");
      }

      // Get file from storage via StorageService
      const fileData = await this.storageService.get(fileMetadata.path);

      // Update IP usage statistics
      this.filesService.updateIpUsage(req.ip, fileMetadata.size, false);

      // Set response headers
      res.set({
        "Content-Type": fileData.mimetype || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileData.filename)}"`,
        "Content-Length": fileData.size,
      });

      // Step 5: Handle stream errors
      fileData.stream.on("error", (err) => {
        this.logger.error(
          File.DOWNLOAD_FILE,
          `Error streaming file: ${fileMetadata.path}`,
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
        fileData.stream.destroy();
      });

      // Stream the file to the response
      fileData.stream.pipe(res);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        File.DOWNLOAD_FILE,
        `Error retrieving file: ${publicKey}`,
        error
      );

      if (error.message === "File not found") {
        throw new NotFoundException("File not found");
      }

      throw new InternalServerErrorException("Failed to retrieve file");
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
