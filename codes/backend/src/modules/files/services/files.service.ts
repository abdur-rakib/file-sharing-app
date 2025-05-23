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

@Injectable()
export class FilesService {
  constructor(
    @Inject(forwardRef(() => FileManageFactory))
    private readonly fileManageFactory: FileManageFactory,
    private readonly filesRepo: FilesRepository,
    private readonly ipUsageRepo: IpUsageRepository,
    private readonly configService: ConfigService
  ) {}

  getFileByPublicKey(publicKey: string) {
    return this.filesRepo.findByPublicKey(publicKey);
  }

  deleteFileByPrivateKey(privateKey: string) {
    // Find the file metadata
    const file = this.filesRepo.findByPrivateKey(privateKey);
    if (!file) {
      return null;
    }

    // Delete the actual file from disk/cloud storage
    const provider =
      this.configService.get<IFileConfig>("file").fileUplaodServiceProvider;
    const fileManageService = this.fileManageFactory.getService(provider);

    fileManageService.delete(file);

    // Delete metadata from DB
    return this.filesRepo.deleteByPrivateKey(privateKey);
  }

  updateIpUsage(ip: string, size: number, isUpload: boolean) {
    const today = getToday();
    this.ipUsageRepo.updateIpUsage(ip, size, isUpload, today);
  }
}
