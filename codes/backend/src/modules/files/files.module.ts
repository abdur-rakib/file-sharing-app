import { Module } from "@nestjs/common";
import { FilesService } from "./services/files.service";
import { FilesController } from "./files.controller";
import { FilesRepository } from "./repositories/files.repository";
import { IpUsageRepository } from "./repositories/ip-usage.repository";
import { FileUploadFactory } from "./services/file-upload.factory";
import { LocalFileUploadService } from "./services/local-file-upload.service";
import { GoogleFileUploadService } from "./services/google-file-upload.service";
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
    LocalFileUploadService,
    GoogleFileUploadService,
    FileCleanupService,
  ],
})
export class FilesModule {}
