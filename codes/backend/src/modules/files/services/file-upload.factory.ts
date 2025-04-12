// file-upload.factory.ts
import { Injectable } from "@nestjs/common";
import { LocalFileUploadService } from "./local-file-upload.service";
import { GoogleFileUploadService } from "./google-file-upload.service";
import { IFileUploadService } from "../interfaces/files.interface";

@Injectable()
export class FileUploadFactory {
  constructor(
    private readonly localService: LocalFileUploadService,
    private readonly googleService: GoogleFileUploadService
  ) {}

  getService(provider: "local" | "google"): IFileUploadService {
    switch (provider) {
      case "google":
        return this.googleService;
      case "local":
      default:
        return this.localService;
    }
  }
}
