import { Module } from "@nestjs/common";
import { FilesService } from "./services/files.service";
import { FilesController } from "./files.controller";
import { FilesRepository } from "./repositories/files.repository";
import { IpUsageRepository } from "./repositories/ip-usage.repository";
import { FileUploadFactory } from "./services/file-upload.factory";
import { LocalFileManageService } from "./services/local-file-manage.service";
import { CloudFileManageService } from "./services/cloud-file-manage.service";
import { FileCleanupService } from "./services/file-cleanup.service";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  controllers: [FilesController],
  imports: [ScheduleModule.forRoot()],
  providers: [
    FilesService,
    FilesRepository,
    IpUsageRepository,
    FileUploadFactory,
    LocalFileManageService,
    CloudFileManageService,
    FileCleanupService,
  ],
})
export class FilesModule {}
