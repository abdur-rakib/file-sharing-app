// local-file-upload.service.ts
import { Injectable } from "@nestjs/common";
import { IFileUploadService } from "../interfaces/files.interface";
import { FilesService } from "./files.service";

@Injectable()
export class LocalFileUploadService implements IFileUploadService {
  constructor(private readonly filesService: FilesService) {}
  async upload(file: Express.Multer.File, ip: string): Promise<any> {
    // Add any metadata logic or database logging here
    const fileData = this.filesService.uploadFile(file, ip);
    return fileData;
  }
}
