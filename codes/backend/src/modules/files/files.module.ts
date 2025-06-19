import { Module } from "@nestjs/common";
import { FilesService } from "./services/files.service";
import { FilesController } from "./files.controller";
import { FilesRepository } from "./repositories/files.repository";
import { IpUsageRepository } from "./repositories/ip-usage.repository";
import { FileCleanupService } from "./services/file-cleanup.service";
import { ScheduleModule } from "@nestjs/schedule";
import { FileMetadataService } from "./services/files-metadata.service";
import { StorageModule } from "../storage/storage.module";
import { StorageService } from "../storage/storage.service";

@Module({
  controllers: [FilesController],
  imports: [ScheduleModule.forRoot(), StorageModule],
  providers: [
    FilesService,
    FilesRepository,
    IpUsageRepository,
    FileCleanupService,
    FileMetadataService,
  ],
})
export class FilesModule {}
