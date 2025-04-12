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
import * as fs from "fs";
import { diskStorage } from "multer";
import * as path from "path";
import { extname } from "path";
import { File } from "../../common/enums/logging-tag.enum";
import { IControllerResult } from "../../common/interfaces/controller-result.interface";
import { IAppConfig } from "../../config/config.interface";
import { CustomLogger } from "../../shared/services/custom-logger.service";
import { IpUsageRepository } from "./repositories/ip-usage.repository";
import { FileUploadFactory } from "./services/file-upload.factory";
import { FilesService } from "./services/files.service";

@Controller({ path: "files", version: "v1" })
@ApiTags("Files")
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly fileUploadFactory: FileUploadFactory,
    private readonly configservice: ConfigService,
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
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request
  ): Promise<IControllerResult> {
    this.logger.log(File.UPLOAD_FILE, "Upload file request initialized");
    if (!file) {
      throw new BadRequestException("File is required");
    }

    // const fileData = this.filesService.uploadFile(file, req.ip);
    const fileUplaodServiceProvider =
      this.configservice.get<IAppConfig>("app").fileUplaodServiceProvider;

    // get file upload service from the factory
    const uploadService = this.fileUploadFactory.getService(
      fileUplaodServiceProvider
    );

    const data = await uploadService.upload(file, req.ip);

    return { message: "File uploaded successfully", data };
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
    const file = await this.filesService.getFileByPublicKey(publicKey);
    this.logger.log(File.DOWNLOAD_FILE, "Download file request initialized", {
      file,
      publicKey,
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
    this.filesService.updateIpUsage(req.ip, file.size, false);

    // Set the headers for the response
    res.set({
      "Content-Type": file.mimetype,
      "Content-Disposition": `attachment; filename="${file.filename}"`,
    });

    // Create a read stream and pipe it to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
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
  remove(@Param("privateKey") privateKey: string): IControllerResult {
    this.logger.log(File.DELETE_FILE, "Delete file request initialized", {
      privateKey,
    });
    // Check if the file exists in the database
    const deleted = this.filesService.deleteFileByPrivateKey(privateKey);
    if (!deleted) throw new NotFoundException("File not found");

    return { message: "File deleted successfully" };
  }
}
