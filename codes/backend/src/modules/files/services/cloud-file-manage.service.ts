import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { IFileManageService } from "../interfaces/files.interface";
import { FilesService } from "./files.service";

@Injectable()
export class CloudFileManageService implements IFileManageService {
  constructor(
    @Inject(forwardRef(() => FilesService))
    private readonly filesService: FilesService
  ) {}
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
    const fileData = this.filesService.uploadFile(updatedFile, ip);
    return fileData;
  }
  delete(file: Express.Multer.File): any {}
}
