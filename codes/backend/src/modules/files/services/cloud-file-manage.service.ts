import { Injectable } from "@nestjs/common";
import { IFileManageService } from "../interfaces/files.interface";
import { FileMetadataService } from "./files-metadata.service";

@Injectable()
export class CloudFileManageService implements IFileManageService {
  constructor(private readonly fileMetadataService: FileMetadataService) {}
  async upload(file: Express.Multer.File, ip: string): Promise<any> {
    // Replace with actual Google Cloud logic
    // return {
    //   path: `gs://bucket-name/${file.originalname}`,
    //   uploadedBy: ip,
    // };
    // upload file to Google Cloud
    // clean up local directory file
    // get updated file after uploading to Google Cloud
    const updatedFile = file;
    const fileData = this.fileMetadataService.saveFileMetadata(updatedFile, ip);
    return fileData;
  }
  delete(file: Express.Multer.File): any {}
}
