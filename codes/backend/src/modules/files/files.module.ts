import { Module } from "@nestjs/common";
import { FilesService } from "./services/files.service";
import { FilesController } from "./files.controller";
import { FilesRepository } from "./repositories/files.repository";
import { IpUsageRepository } from "./repositories/ip-usage.repository";
import { FileManageFactory } from "./services/file-manage.factory";
import { LocalFileManageService } from "./services/local-file-manage.service";
import { CloudFileManageService } from "./services/cloud-file-manage.service";
import { FileCleanupService } from "./services/file-cleanup.service";
import { ScheduleModule } from "@nestjs/schedule";
import { FileMetadataService } from "./services/files-metadata.service";

@Module({
  controllers: [FilesController],
  imports: [ScheduleModule.forRoot()],
  providers: [
    LocalFileManageService,
    CloudFileManageService,
    FilesService,
    FilesRepository,
    IpUsageRepository,
    FileCleanupService,
    FileManageFactory,
    FileMetadataService,
  ],
})
export class FilesModule {}
