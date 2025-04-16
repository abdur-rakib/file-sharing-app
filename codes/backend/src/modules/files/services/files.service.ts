import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import * as fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { File } from "../../../common/enums/logging-tag.enum";
import { getToday } from "../../../common/utils/date.utils";
import { CustomLogger } from "../../../shared/services/custom-logger.service";
import { FilesRepository } from "../repositories/files.repository";
import { IpUsageRepository } from "../repositories/ip-usage.repository";

@Injectable()
export class FilesService {
  constructor(
    private readonly filesRepo: FilesRepository,
    private readonly ipUsageRepo: IpUsageRepository,
    private readonly logger: CustomLogger
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

  deleteFileByPrivateKey(privateKey: string) {
    // Find the file metadata
    const file = this.filesRepo.findByPrivateKey(privateKey);
    if (!file) {
      throw new NotFoundException("File not found");
    }

    // Delete the actual file from disk
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      } else {
        this.logger.warn(
          File.DELETE_FILE,
          `File at path "${file.path}" not found during deletion`
        );
      }
    } catch (err) {
      this.logger.error(`Failed to delete file at ${file.path}`, err);
      throw new InternalServerErrorException(
        "Failed to delete file from storage"
      );
    }

    // Delete metadata from DB
    return this.filesRepo.deleteByPrivateKey(privateKey);
  }

  updateIpUsage(ip: string, size: number, isUpload: boolean) {
    const today = getToday();
    this.ipUsageRepo.updateIpUsage(ip, size, isUpload, today);
  }
}
