import { Injectable } from "@nestjs/common";
import { StorageService } from "src/modules/storage/storage.service";
import { getToday } from "../../../common/utils/date.utils";
import { FilesRepository } from "../repositories/files.repository";
import { IpUsageRepository } from "../repositories/ip-usage.repository";
import { FileMetadataService } from "./files-metadata.service";

@Injectable()
export class FilesService {
  constructor(
    private readonly filesRepo: FilesRepository,
    private readonly ipUsageRepo: IpUsageRepository,
    private readonly fileMetadataService: FileMetadataService,
    private readonly storageService: StorageService
  ) {}

  async saveFile(file: Express.Multer.File, ip: string) {
    const fileData = await this.storageService.save(file);

    // Save file metadata to the database
    const fileMetadata = this.fileMetadataService.saveFileMetadata(
      fileData as Express.Multer.File,
      ip
    );
    return fileMetadata;
  }

  getFileByPublicKey(publicKey: string) {
    return this.filesRepo.findByPublicKey(publicKey);
  }

  async deleteFileByPrivateKey(privateKey: string) {
    // Find the file metadata
    const file = this.filesRepo.findByPrivateKey(privateKey);
    if (!file) {
      return null;
    }

    // Delete the file from storage
    await this.storageService.delete(file.path);

    // Delete metadata from DB
    return this.filesRepo.deleteByPrivateKey(privateKey);
  }

  updateIpUsage(ip: string, size: number, isUpload: boolean) {
    const today = getToday();
    this.ipUsageRepo.updateIpUsage(ip, size, isUpload, today);
  }
}
