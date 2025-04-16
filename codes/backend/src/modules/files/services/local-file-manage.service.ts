// local-file-upload.service.ts
import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { IFileManageService } from "../interfaces/files.interface";
import { FilesService } from "./files.service";
import { CustomLogger } from "../../../shared/services/custom-logger.service";
import * as fs from "fs";
import { File } from "../../../common/enums/logging-tag.enum";

@Injectable()
export class LocalFileManageService implements IFileManageService {
  constructor(
    @Inject(forwardRef(() => FilesService))
    private readonly filesService: FilesService,
    private readonly logger: CustomLogger
  ) {
    this.logger.setContext(LocalFileManageService.name);
  }
  upload(file: Express.Multer.File, ip: string): any {
    // Add any metadata logic or database logging here
    const fileData = this.filesService.uploadFile(file, ip);
    return fileData;
  }
  delete(file: Express.Multer.File): any {
    // Delete the actual file from disk
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      } else {
        this.logger.warn(
          File.DELETE_FILE,
          `File at path "${file.path}" not found during deletion`
        );
      }
    } catch (err) {
      this.logger.error(`Failed to delete file at ${file.path}`, err);
      throw new InternalServerErrorException(
        "Failed to delete file from storage"
      );
    }
  }
}
