import { Module } from "@nestjs/common";
import { FilesService } from "./services/files.service";
import { FilesController } from "./files.controller";
import { FilesRepository } from "./repositories/files.repository";
import { IpUsageRepository } from "./repositories/ip-usage.repository";
import { FileCleanupService } from "./services/file-cleanup.service";
import { ScheduleModule } from "@nestjs/schedule";
import { FileMetadataService } from "./services/files-metadata.service";
import { LocalStorageProvider } from "./services/local-file-storage.service";
// import { GoogleStorageProvider } from "./services/google-storage.service";
import { FileStorageFactory } from "./services/file-storage.factory";

@Module({
  controllers: [FilesController],
  imports: [ScheduleModule.forRoot()],
  providers: [
    LocalStorageProvider,
    // GoogleStorageProvider,
    FilesService,
    FilesRepository,
    IpUsageRepository,
    FileCleanupService,
    FileStorageFactory,
    FileMetadataService,
  ],
})
export class FilesModule {}
