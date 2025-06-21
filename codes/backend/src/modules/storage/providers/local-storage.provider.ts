import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createReadStream, ReadStream } from "fs";
import { promises as fsPromises } from "fs";
import * as path from "path";
import { CustomLogger } from "../../../shared/services/custom-logger.service";
import { File } from "../../../common/enums/logging-tag.enum";
import {
  IStorageFile,
  IStorageProvider,
} from "../interfaces/storage.interface";

@Injectable()
export class LocalStorageProvider implements IStorageProvider {
  private readonly baseDir: string;

  constructor(
    private readonly logger: CustomLogger,
    private readonly configService: ConfigService
  ) {
    this.logger.setContext(LocalStorageProvider.name);
    this.baseDir =
      this.configService.get<string>("FOLDER") ||
      path.join(process.cwd(), "uploads");
    this.ensureDirectory();
  }

  /**
   * Ensure the storage directory exists
   * @private
   */
  private async ensureDirectory(): Promise<void> {
    try {
      await fsPromises.mkdir(this.baseDir, { recursive: true });
    } catch (err) {
      if (err.code !== "EEXIST") {
        this.logger.error(
          File.STORAGE_DIR,
          `Failed to create storage directory: ${this.baseDir}`,
          err
        );
        throw err;
      }
    }
  }

  /**
   * Save a file to local storage
   * @param file The file to save
   * @returns Storage metadata
   */
  async saveFile(file: Express.Multer.File): Promise<IStorageFile> {
    try {
      // The file is already saved by multer, just return metadata
      return {
        path: file.path,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (err) {
      this.logger.error(
        File.UPLOAD_FILE,
        `Failed to process file: ${file.originalname}`,
        err
      );
      throw new Error("Failed to save file to storage");
    }
  }

  /**
   * Get a file from local storage
   * @param filePath The file path
   * @returns File stream and metadata
   */
  async getFile(filePath: string): Promise<IStorageFile> {
    try {
      // Normalize and validate path
      const normalizedPath = path.normalize(filePath);
      const resolvedPath = path.resolve(normalizedPath);
      const resolvedBaseDir = path.resolve(this.baseDir);

      // Security check to prevent path traversal
      if (!resolvedPath.startsWith(resolvedBaseDir)) {
        throw new Error("Invalid file path - path traversal attempt");
      }

      // Check if file exists
      await fsPromises.access(resolvedPath);

      // Get file stats
      const stats = await fsPromises.stat(resolvedPath);

      // Get filename from path
      const filename = path.basename(resolvedPath);

      // Determine mimetype (simplified - in production you would use mime-types package)
      const ext = path.extname(resolvedPath).toLowerCase();
      const mimeMap: Record<string, string> = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".pdf": "application/pdf",
        ".txt": "text/plain",
        ".doc": "application/msword",
        ".docx":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      };

      const mimetype = mimeMap[ext] || "application/octet-stream";

      // Create a read stream
      const stream = createReadStream(resolvedPath);

      return {
        stream,
        size: stats.size,
        mimetype,
        filename,
        path: resolvedPath,
      };
    } catch (err) {
      if (err.code === "ENOENT") {
        throw new Error("File not found");
      }
      this.logger.error(
        File.DOWNLOAD_FILE,
        `Failed to retrieve file: ${filePath}`,
        err
      );
      throw err;
    }
  }

  /**
   * Delete a file from local storage
   * @param filePath The file path
   * @returns Whether deletion was successful
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      // Normalize and validate path
      const normalizedPath = path.normalize(filePath);
      const resolvedPath = path.resolve(normalizedPath);
      const resolvedBaseDir = path.resolve(this.baseDir);

      // Security check to prevent path traversal
      if (!resolvedPath.startsWith(resolvedBaseDir)) {
        throw new Error("Invalid file path - path traversal attempt");
      }

      try {
        await fsPromises.unlink(resolvedPath);
        return true;
      } catch (err) {
        if (err.code === "ENOENT") {
          // File already doesn't exist, which is what we want
          this.logger.warn(
            File.DELETE_FILE,
            `File not found during deletion: ${filePath}`
          );
          return true;
        }
        throw err;
      }
    } catch (err) {
      this.logger.error(
        File.DELETE_FILE,
        `Failed to delete file: ${filePath}`,
        err
      );
      throw err;
    }
  }

  /**
   * Check if a file exists in local storage
   * @param filePath The file path
   * @returns Whether the file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      // Normalize and validate path
      const normalizedPath = path.normalize(filePath);
      const resolvedPath = path.resolve(normalizedPath);
      const resolvedBaseDir = path.resolve(this.baseDir);

      // Security check to prevent path traversal
      if (!resolvedPath.startsWith(resolvedBaseDir)) {
        return false;
      }

      await fsPromises.access(resolvedPath);
      return true;
    } catch (err) {
      if (err.code === "ENOENT") {
        return false;
      }
      this.logger.error(
        File.FILE_CHECK,
        `Error checking if file exists: ${filePath}`,
        err
      );
      throw err;
    }
  }
}
