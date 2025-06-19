import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { getToday } from "../../../common/utils/date.utils";
import { IFileConfig } from "../../../config/config.interface";
import { FilesRepository } from "../repositories/files.repository";
import { IpUsageRepository } from "../repositories/ip-usage.repository";
import { FileStorageFactory } from "./file-storage.factory";
import { FileMetadataService } from "./files-metadata.service";

@Injectable()
export class FilesService {
  constructor(
    @Inject(forwardRef(() => FileStorageFactory))
    private readonly fileStorageFactory: FileStorageFactory,
    private readonly filesRepo: FilesRepository,
    private readonly ipUsageRepo: IpUsageRepository,
    private readonly configService: ConfigService,
    private readonly fileMetadataService: FileMetadataService
  ) {}

  async saveFile(file: Express.Multer.File, ip: string) {
    // get the file storage provider
    const provider =
      this.configService.get<IFileConfig>("file").fileUplaodServiceProvider;
    const fileStorageService = this.fileStorageFactory.getService(provider);
    // save file to disk storage
    await fileStorageService.saveFile(file);

    // Save file metadata to the database
    const fileMetadata = this.fileMetadataService.saveFileMetadata(file, ip);
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

    // Delete the actual file from disk/cloud storage
    const provider =
      this.configService.get<IFileConfig>("file").fileUplaodServiceProvider;
    const fileStorageService = this.fileStorageFactory.getService(provider);

    await fileStorageService.deleteFile(file.path);

    // Delete metadata from DB
    return this.filesRepo.deleteByPrivateKey(privateKey);
  }

  updateIpUsage(ip: string, size: number, isUpload: boolean) {
    const today = getToday();
    this.ipUsageRepo.updateIpUsage(ip, size, isUpload, today);
  }
}
