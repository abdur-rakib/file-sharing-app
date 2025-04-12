import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { getToday } from "../../../common/utils/date.utils";
import { FilesRepository } from "../repositories/files.repository";
import * as fs from "fs";
import * as path from "path";
import { IpUsageRepository } from "../repositories/ip-usage.repository";
import { CustomLogger } from "../../../shared/services/custom-logger.service";
import { File } from "src/common/enums/logging-tag.enum";

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

    // construct the file data object
    // using the file information and the generated keys
    const fileData = {
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      publicKey,
      privateKey,
      uploadedAt: new Date().toISOString(),
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
