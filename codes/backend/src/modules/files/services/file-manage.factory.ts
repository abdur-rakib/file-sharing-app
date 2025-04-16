// file-upload.factory.ts
import { Injectable } from "@nestjs/common";
import { LocalFileManageService } from "./local-file-manage.service";
import { CloudFileManageService } from "./cloud-file-manage.service";
import { IFileManageService } from "../interfaces/files.interface";

@Injectable()
export class FileManageFactory {
  constructor(
    private readonly localService: LocalFileManageService,
    private readonly cloudService: CloudFileManageService
  ) {}

  getService(provider: "local" | "google"): IFileManageService {
    switch (provider) {
      case "google":
        return this.cloudService;
      case "local":
        return this.localService;
      default:
        return this.localService; // Default to local if no valid provider is found
    }
  }
}
