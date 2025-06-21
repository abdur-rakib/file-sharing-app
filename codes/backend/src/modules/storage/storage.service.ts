import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IFileConfig } from "src/config/config.interface";
import { StorageFactory } from "./storage.factory";
import { IStorageFile } from "./interfaces/storage.interface";
import { CustomLogger } from "../../shared/services/custom-logger.service";
import { File } from "../../common/enums/logging-tag.enum";

@Injectable()
export class StorageService {
  private readonly provider: "local" | "google";
  constructor(
    private readonly configService: ConfigService,
    private readonly storageFactory: StorageFactory,
    private readonly logger: CustomLogger
  ) {
    this.provider =
      this.configService.get<IFileConfig>("file").fileUplaodServiceProvider;
    this.logger.setContext(StorageService.name);
  }
  async save(file: Express.Multer.File): Promise<IStorageFile> {
    const storageService = this.storageFactory.getService(this.provider);
    this.logger.log(
      File.UPLOAD_FILE,
      `Saving file using provider: ${this.provider}`
    );

    // save file to disk storage
    return await storageService.saveFile(file);
  }

  async delete(path: string): Promise<void> {
    const storageService = this.storageFactory.getService(this.provider);
    // delete file from disk storage
    await storageService.deleteFile(path);
  }
}
