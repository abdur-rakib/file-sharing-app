import {
  BadRequestException,
  Controller,
  Delete,
  Get,
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
import * as fs from "fs";
import { diskStorage } from "multer";
import * as path from "path";
import { extname } from "path";
import { IControllerResult } from "src/common/interfaces/controller-result.interface";
import { FilesService } from "./files.service";
import { Request, Response } from "express";
import { IpUsageRepository } from "./ip-usage.repository";
import { CustomLogger } from "src/shared/services/custom-logger.service";
import { File } from "src/common/enums/logging-tag.enum";

@Controller({ path: "files", version: "v1" })
@ApiTags("Files")
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly ipUsageRepo: IpUsageRepository,
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
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, process.env.FILE_UPLOAD_PATH || "./uploads");
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, uniqueSuffix + ext);
        },
      }),
    })
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request
  ): IControllerResult {
    if (!file) {
      throw new BadRequestException("File is required");
    }
    this.logger.log(File.UPLOAD_FILE, "Upload file request initialized", {
      file,
    });

    const fileData = this.filesService.uploadFile(file, req.ip);
    return { message: "File uploaded successfully", data: fileData };
  }

  @Get(":public_key")
  @ApiOperation({ summary: "Download a file by public key" })
  @ApiParam({
    name: "public_key",
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
    @Param("public_key") public_key: string,
    @Res() res: Response
  ) {
    const file = await this.filesService.getFileByPublicKey(public_key);
    this.logger.log(File.DOWNLOAD_FILE, "Download file request initialized", {
      file,
      public_key,
    });
    if (!file) {
      throw new NotFoundException("File not found");
    }

    // Check if the file exists on disk
    const filePath = path.resolve(file.path);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException("File not found on disk");
    }

    // update the IP usage in the database
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    this.ipUsageRepo.updateIpUsage(res.req.ip, file.size, false, today);

    // Set the headers for the response
    res.set({
      "Content-Type": file.mimetype,
      "Content-Disposition": `attachment; filename="${file.filename}"`,
    });

    // Create a read stream and pipe it to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  @Delete(":private_key")
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
  remove(@Param("private_key") private_key: string): IControllerResult {
    this.logger.log(File.DELETE_FILE, "Delete file request initialized", {
      private_key,
    });
    // Check if the file exists in the database
    const deleted = this.filesService.deleteFileByPrivateKey(private_key);
    if (!deleted) throw new NotFoundException("File not found");

    return { message: "File deleted successfully" };
  }
}
