import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { FilesRepository } from "./files.repository";
import { IpUsageRepository } from "./ip-usage.repository";

@Injectable()
export class FilesService {
  constructor(
    private readonly filesRepo: FilesRepository,
    private readonly ipUsageRepo: IpUsageRepository
  ) {}
  uploadFile(file: Express.Multer.File, ip: string) {
    const public_key = uuidv4();
    const private_key = uuidv4();

    // construct the file data object
    // using the file information and the generated keys
    const fileData = {
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      public_key,
      private_key,
      uploaded_at: new Date().toISOString(),
    };

    // save the file data to the database
    this.filesRepo.save(fileData);

    // update the IP usage in the database
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    this.ipUsageRepo.updateIpUsage(ip, file.size, true, today);

    // return the public and private keys
    return { public_key, private_key };
  }

  getFileByPublicKey(publicKey: string) {
    return this.filesRepo.findByPublicKey(publicKey);
  }

  deleteFileByPrivateKey(privateKey: string) {
    return this.filesRepo.deleteByPrivateKey(privateKey);
  }
}
