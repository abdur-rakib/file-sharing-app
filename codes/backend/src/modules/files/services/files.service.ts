import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { getToday } from "../../../common/utils/date.utils";
import { FilesRepository } from "../repositories/files.repository";
import { IpUsageRepository } from "../repositories/ip-usage.repository";

@Injectable()
export class FilesService {
  constructor(
    private readonly filesRepo: FilesRepository,
    private readonly ipUsageRepo: IpUsageRepository
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
    return this.filesRepo.deleteByPrivateKey(privateKey);
  }

  updateIpUsage(ip: string, size: number, isUpload: boolean) {
    const today = getToday();
    this.ipUsageRepo.updateIpUsage(ip, size, isUpload, today);
  }
}
