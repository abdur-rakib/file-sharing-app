import { Injectable } from "@nestjs/common";
import { IFileUploadService } from "../interfaces/files.interface";
import { FilesService } from "./files.service";

@Injectable()
export class GoogleFileUploadService implements IFileUploadService {
  constructor(private readonly filesService: FilesService) {}
  async upload(file: Express.Multer.File, ip: string): Promise<any> {
    // Replace with actual Google Cloud logic
    // return {
    //   path: `gs://bucket-name/${file.originalname}`,
    //   uploadedBy: ip,
    // };
    // get updated file after uploading to Google Cloud
    const updatedFile = file;
    const fileData = this.filesService.uploadFile(updatedFile, ip);
    return fileData;
  }
}
