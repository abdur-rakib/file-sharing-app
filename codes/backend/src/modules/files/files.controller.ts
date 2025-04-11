import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { FilesService } from "./files.service";
import {
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { IControllerResult } from "src/common/interfaces/controller-result.interface";

@Controller({ path: "files", version: "v1" })
@ApiTags("Files")
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

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
  upload(@UploadedFile() file: Express.Multer.File): IControllerResult {
    if (!file) {
      throw new BadRequestException("File is required");
    }

    const response = this.filesService.uploadFile(file);
    return { message: "File uploaded successfully", data: response };
  }

  @Get(":public_key")
  @ApiOperation({ summary: "Download a file by public key" })
  @ApiParam({
    name: "public_key",
    description: "Public key associated with the uploaded file",
    type: String,
  })
  @ApiOkResponse({
    description: "Returns file metadata or file content",
    schema: {
      type: "object",
      properties: {
        id: { type: "number" },
        filename: { type: "string" },
        path: { type: "string" },
        mimetype: { type: "string" },
        public_key: { type: "string" },
        private_key: { type: "string" },
        uploaded_at: { type: "string", format: "date-time" },
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
  download(@Param("public_key") public_key: string): IControllerResult {
    const file = this.filesService.getFileByPublicKey(public_key);
    if (!file) throw new NotFoundException("File not found");
    return { message: "File get successfully", data: file };
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
    const deleted = this.filesService.deleteFileByPrivateKey(private_key);
    if (!deleted) throw new NotFoundException("File not found");
    return { message: "File deleted successfully" };
  }
}
