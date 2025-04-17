import { Injectable } from "@nestjs/common";
import { getToday } from "../../../common/utils/date.utils";
import { v4 as uuidv4 } from "uuid";
import { FilesRepository } from "../repositories/files.repository";
import { IpUsageRepository } from "../repositories/ip-usage.repository";

@Injectable()
export class FileMetadataService {
  constructor(
    private readonly filesRepo: FilesRepository,
    private readonly ipUsageRepo: IpUsageRepository
  ) {}

  saveFileMetadata(file: Express.Multer.File, ip: string) {
    const publicKey = uuidv4();
    const privateKey = uuidv4();
    const now = new Date().toISOString();

    const fileData = {
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      publicKey,
      privateKey,
      uploadedAt: now,
      lastAccessedAt: now,
    };

    this.filesRepo.save(fileData);
    this.ipUsageRepo.updateIpUsage(ip, file.size, true, getToday());

    return fileData;
  }
}
