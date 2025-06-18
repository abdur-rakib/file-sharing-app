import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { promises as fsPromises } from "fs";
import * as path from "path";
import { File } from "../../../common/enums/logging-tag.enum";
import { CustomLogger } from "../../../shared/services/custom-logger.service";
import { IFileManageService } from "../interfaces/files.interface";
import { FileMetadataService } from "./files-metadata.service";

@Injectable()
export class LocalFileManageService implements IFileManageService {
  constructor(
    private readonly fileMetadataService: FileMetadataService,
    private readonly logger: CustomLogger
  ) {
    this.logger.setContext(LocalFileManageService.name);
  }

  upload(file: Express.Multer.File, ip: string): any {
    // Validate file exists
    if (!file || !file.path) {
      this.logger.error(File.UPLOAD_FILE, "Invalid file object received");
      throw new InternalServerErrorException("Invalid file upload");
    }

    try {
      // Add any metadata logic or database logging here
      const fileData = this.fileMetadataService.saveFileMetadata(file, ip);
      this.logger.log(
        File.UPLOAD_FILE,
        `File uploaded successfully: ${file.filename}`
      );
      return fileData;
    } catch (error) {
      this.logger.error(
        File.UPLOAD_FILE,
        `Failed to process uploaded file: ${file.filename}`,
        error
      );
      throw new InternalServerErrorException("Failed to process uploaded file");
    }
  }

  async delete(file: Express.Multer.File): Promise<void> {
    if (!file || !file.path) {
      this.logger.error(File.DELETE_FILE, "Invalid file object received");
      throw new InternalServerErrorException("Invalid file deletion request");
    }

    try {
      // Normalize path for security
      const normalizedPath = path.normalize(file.path);

      // Delete the actual file from disk using async API
      await fsPromises.unlink(normalizedPath);
      this.logger.log(
        File.DELETE_FILE,
        `File deleted successfully: ${file.filename}`
      );
    } catch (err) {
      // Handle case where file doesn't exist (ENOENT)
      if (err.code === "ENOENT") {
        this.logger.warn(
          File.DELETE_FILE,
          `File at path "${file.path}" not found during deletion`
        );
        // File doesn't exist, which is essentially the state we wanted to reach
        return;
      }

      // Log detailed error for other cases
      this.logger.error(
        File.DELETE_FILE,
        `Failed to delete file at ${file.path}`,
        err
      );
      throw new InternalServerErrorException(
        "Failed to delete file from storage"
      );
    }
  }
}
