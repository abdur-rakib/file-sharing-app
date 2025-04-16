import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { getToday } from "../../../common/utils/date.utils";
import { FilesRepository } from "../repositories/files.repository";
import { IpUsageRepository } from "../repositories/ip-usage.repository";
import { FileManageFactory } from "./file-manage.factory";
import { ConfigService } from "@nestjs/config";
import { IAppConfig } from "../../../config/config.interface";

@Injectable()
export class FilesService {
  constructor(
    @Inject(forwardRef(() => FileManageFactory))
    private readonly fileManageFactory: FileManageFactory,
    private readonly filesRepo: FilesRepository,
    private readonly ipUsageRepo: IpUsageRepository,
    private readonly configService: ConfigService
  ) {}
  uploadFile(file: Express.Multer.File, ip: string) {
    const publicKey = uuidv4();
    const privateKey = uuidv4();
    const now = new Date().toISOString();

    // construct the file data object
    // using the file information and the generated keys
    const fileData = {
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      publicKey,
      privateKey,
      uploadedAt: now,
      lastAccessedAt: now,
    };

    // save the file data to the database
    this.filesRepo.save(fileData);

    // update the IP usage in the database
    this.updateIpUsage(ip, file.size, true);

    // return the public and private keys
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
      this.configService.get<IAppConfig>("app").fileUplaodServiceProvider;
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
