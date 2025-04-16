// file-upload.factory.ts
import { Injectable } from "@nestjs/common";
import { LocalFileManageService } from "./local-file-manage.service";
import { CloudFileManageService } from "./cloud-file-manage.service";
import { IFileManageService } from "../interfaces/files.interface";

@Injectable()
export class FileUploadFactory {
  constructor(
    private readonly localService: LocalFileManageService,
    private readonly cloudService: CloudFileManageService
  ) {}

  getService(provider: "local" | "google"): IFileManageService {
    switch (provider) {
      case "google":
        return this.cloudService;
      case "local":
      default:
        return this.localService;
    }
  }
}
