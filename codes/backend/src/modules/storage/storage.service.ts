import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IFileConfig } from "src/config/config.interface";
import { StorageFactory } from "./storage.factory";
import { IStorageFile } from "./interfaces/storage.interface";

@Injectable()
export class StorageService {
  constructor(
    private readonly configService: ConfigService,
    private readonly storageFactory: StorageFactory
  ) {}
  async save(file: Express.Multer.File): Promise<IStorageFile> {
    // get the file storage provider
    const provider =
      this.configService.get<IFileConfig>("file").fileUplaodServiceProvider;
    const storageService = this.storageFactory.getService(provider);
    // save file to disk storage
    return await storageService.saveFile(file);
  }

  async delete(path: string): Promise<void> {
    // get the file storage provider
    const provider =
      this.configService.get<IFileConfig>("file").fileUplaodServiceProvider;
    const storageService = this.storageFactory.getService(provider);
    // delete file from disk storage
    await storageService.deleteFile(path);
  }
}
