import { Storage } from "@google-cloud/storage";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createReadStream, promises as fsPromises } from "fs";
import * as path from "path";
import { File } from "../../../common/enums/logging-tag.enum";
import { CustomLogger } from "../../../shared/services/custom-logger.service";
import {
  IFileResponse,
  IStorageFile,
  IStorageProvider,
} from "../interfaces/storage.interface";

interface GoogleStorageConfig {
  projectId: string;
  bucketName: string;
  keyFilename?: string;
  credentials?: Record<string, unknown>;
}

@Injectable()
export class GoogleStorageProvider implements IStorageProvider {
  private readonly storage: Storage;
  private readonly bucket: string;
  private readonly tmpDir: string;

  constructor(
    private readonly logger: CustomLogger,
    private readonly configService: ConfigService
  ) {
    this.logger.setContext(GoogleStorageProvider.name);
    // Load configuration from CONFIG environment variable
    const configPath = this.configService.get<string>("CONFIG");
    if (!configPath) {
      throw new Error(
        "Google Cloud Storage CONFIG environment variable is required"
      );
    }
    try {
      // Parse the config file
      const configJson = require(configPath) as GoogleStorageConfig;

      this.bucket = this.configService.get<string>("STORAGE_BUCKET");
      this.tmpDir = path.join(process.cwd(), "tmp");
      // Initialize Google Cloud Storage
      this.storage = new Storage({
        projectId: configJson.projectId,
        keyFilename: configPath,
      });
    } catch (err) {
      this.logger.error(
        File.STORAGE_INIT,
        "Failed to initialize Google Cloud Storage",
        err
      );
      throw new Error(
        "Failed to initialize Google Cloud Storage: " + err.message
      );
    }
    this.ensureTempDirectory();
  }

  /**
   * Ensure temporary directory exists
   */
  private async ensureTempDirectory(): Promise<void> {
    try {
      await fsPromises.mkdir(this.tmpDir, { recursive: true });
    } catch (err) {
      if (err.code !== "EEXIST") {
        this.logger.error(
          File.STORAGE_DIR,
          `Failed to create temp directory: ${this.tmpDir}`,
          err
        );
        throw err;
      }
    }
  }

  /**
   * Save a file to Google Cloud Storage
   * @param file The file to save
   * @returns Storage metadata
   */
  async saveFile(file: Express.Multer.File): Promise<IStorageFile> {
    try {
      const filename = path.basename(file.path);
      const blob = this.storage.bucket(this.bucket).file(filename);
      // Upload the file to Google Cloud Storage
      await new Promise<void>((resolve, reject) => {
        const blobStream = blob.createWriteStream({
          resumable: false,
          contentType: file.mimetype,
        });
        blobStream.on("error", (err) => {
          this.logger.error(
            File.UPLOAD_FILE,
            `Error uploading to Google Cloud: ${filename}`,
            err
          );
          reject(err);
        });
        blobStream.on("finish", () => {
          resolve();
        });
        // Create a read stream from the file and pipe it to GCS
        createReadStream(file.path)
          .pipe(blobStream)
          .on("error", (err) => {
            blobStream.destroy();
            reject(err);
          });
      });

      const [url] = await blob.getSignedUrl({
        action: "read",
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
      });
      const publicUrl = url;
      // Clean up local file if it exists
      try {
        await fsPromises.unlink(file.path);
      } catch (err) {
        this.logger.warn(
          File.UPLOAD_FILE,
          `Could not delete local file after upload: ${file.path}`,
          err
        );
      }
      return {
        path: publicUrl,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (err) {
      this.logger.error(
        File.UPLOAD_FILE,
        `Failed to upload to Google Cloud: ${file.originalname}`,
        err
      );
      throw new Error("Failed to save file to Google Cloud Storage");
    }
  }

  /**
   * Get a file from Google Cloud Storage
   * @param filePath The file path or URL
   * @returns File stream and metadata
   */
  async getFile(filePath: string): Promise<IFileResponse> {
    try {
      // Extract the filename from the URL or path
      const filename = path.basename(filePath);
      const file = this.storage.bucket(this.bucket).file(filename);
      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error("File not found in Google Cloud Storage");
      }
      // Get file metadata
      const [metadata] = await file.getMetadata();
      // Download to temp file and create a read stream
      const tempFilePath = path.join(this.tmpDir, filename);
      await file.download({ destination: tempFilePath });
      const stream = createReadStream(tempFilePath);
      // Delete temp file when stream closes
      stream.on("close", async () => {
        try {
          await fsPromises.unlink(tempFilePath);
        } catch (err) {
          this.logger.warn(
            File.DOWNLOAD_FILE,
            `Failed to delete temp file: ${tempFilePath}`,
            err
          );
        }
      });
      return {
        stream,
        size: Number(metadata.size),
        mimetype: metadata.contentType,
        filename: filename,
        path: filePath,
      };
    } catch (err) {
      this.logger.error(
        File.DOWNLOAD_FILE,
        `Failed to retrieve file from Google Cloud: ${filePath}`,
        err
      );
      throw err;
    }
  }

  /**
   * Delete a file from Google Cloud Storage
   * @param filePath The file path or URL
   * @returns Whether deletion was successful
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      // Extract the filename from the URL or path
      const filename = path.basename(filePath);
      const file = this.storage.bucket(this.bucket).file(filename);
      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        this.logger.warn(
          File.DELETE_FILE,
          `File not found during deletion: ${filename}`
        );
        return true; // File doesn't exist, which is what we want
      }
      // Delete the file
      await file.delete();
      return true;
    } catch (err) {
      this.logger.error(
        File.DELETE_FILE,
        `Failed to delete file from Google Cloud: ${filePath}`,
        err
      );
      throw err;
    }
  }

  /**
   * Check if a file exists in Google Cloud Storage
   * @param filePath The file path or URL
   * @returns Whether the file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      // Extract the filename from the URL or path
      const filename = path.basename(filePath);
      const file = this.storage.bucket(this.bucket).file(filename);
      // Check if file exists
      const [exists] = await file.exists();
      return exists;
    } catch (err) {
      this.logger.error(
        File.FILE_CHECK,
        `Error checking if file exists in Google Cloud: ${filePath}`,
        err
      );
      throw err;
    }
  }
}
