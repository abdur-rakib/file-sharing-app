import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { getToday } from "../../../common/utils/date.utils";
import { FilesRepository } from "../repositories/files.repository";
import { IpUsageRepository } from "../repositories/ip-usage.repository";
import { FileManageFactory } from "./file-manage.factory";
import { ConfigService } from "@nestjs/config";
import { IFileConfig } from "../../../config/config.interface";
import { FileMetadataService } from "./files-metadata.service";

@Injectable()
export class FilesService {
  constructor(
    @Inject(forwardRef(() => FileManageFactory))
    private readonly fileManageFactory: FileManageFactory,
    private readonly filesRepo: FilesRepository,
    private readonly ipUsageRepo: IpUsageRepository,
    private readonly configService: ConfigService,
    private readonly fileMetadataService: FileMetadataService
  ) {}
  uploadFile(file: Express.Multer.File, ip: string) {
    const { publicKey, privateKey } = this.fileMetadataService.saveFileMetadata(
      file,
      ip
    );
    return { publicKey, privateKey };
  }

  getFileByPublicKey(publicKey: string) {
    return this.filesRepo.findByPublicKey(publicKey);
  }

  async deleteFileByPrivateKey(privateKey: string) {
    // Find the file metadata
    const file = this.filesRepo.findByPrivateKey(privateKey);
    if (!file) {
      throw new NotFoundException("File not found");
    }

    // Delete the actual file from disk/cloud storage
    const provider =
      this.configService.get<IFileConfig>("file").fileUplaodServiceProvider;
    const fileManageService = this.fileManageFactory.getService(provider);

    await fileManageService.delete(file);

    // Delete metadata from DB
    return this.filesRepo.deleteByPrivateKey(privateKey);
  }

  updateIpUsage(ip: string, size: number, isUpload: boolean) {
    const today = getToday();
    this.ipUsageRepo.updateIpUsage(ip, size, isUpload, today);
  }
}
