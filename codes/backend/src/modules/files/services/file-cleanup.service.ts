import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron } from "@nestjs/schedule";
import { FilesRepository } from "../repositories/files.repository";
import { FilesService } from "./files.service";
import { CustomLogger } from "../../../shared/services/custom-logger.service";
import { File } from "../../../common/enums/logging-tag.enum";
import { IAppConfig } from "src/config/config.interface";

@Injectable()
export class FileCleanupService {
  constructor(
    private readonly filesRepo: FilesRepository,
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
    private readonly logger: CustomLogger
  ) {
    this.logger.setContext(FileCleanupService.name);
  }

  @Cron(process.env.FILE_CLEANUP_SCHEDULE)
  async cleanupInactiveFiles() {
    const config = this.configService.get<IAppConfig>("app");

    if (!config.fileCleanupEnabled) {
      return;
    }

    try {
      const inactiveFiles = await this.filesRepo.findInactiveFiles(
        config.fileCleanupInactivityDays
      );

      this.logger.log(
        File.DELETE_FILE,
        `Found ${inactiveFiles.length} inactive files for cleanup`
      );

      for (const file of inactiveFiles) {
        try {
          await this.filesService.deleteFileByPrivateKey(file.privateKey);
          this.logger.log(
            File.DELETE_FILE,
            `Cleaned up inactive file: ${file.filename}`
          );
        } catch (error) {
          this.logger.error(
            File.DELETE_FILE,
            `Failed to cleanup file: ${file.filename}`,
            error
          );
        }
      }
    } catch (error) {
      this.logger.error(File.DELETE_FILE, "File cleanup job failed", error);
    }
  }
}
