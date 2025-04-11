import { Module } from "@nestjs/common";
import { FilesService } from "./files.service";
import { FilesController } from "./files.controller";
import { FilesRepository } from "./files.repository";
import { DatabaseService } from "src/database/database.service";

@Module({
  controllers: [FilesController],
  providers: [FilesService, FilesRepository, DatabaseService],
})
export class FilesModule {}
