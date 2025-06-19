import { Injectable } from "@nestjs/common";
import { LocalStorageProvider } from "./local-file-storage.service";
import { IStorageProvider } from "../interfaces/storage.interface";
// import { GoogleStorageProvider } from "./google-storage.service";

@Injectable()
export class FileStorageFactory {
  constructor(
    private readonly localStorageService: LocalStorageProvider
    // private readonly googleStorageProvider: GoogleStorageProvider
  ) {}

  getService(provider: "local" | "google"): IStorageProvider {
    switch (provider) {
      // case "google":
      //   return this.googleStorageProvider;
      case "local":
        return this.localStorageService;
      default:
        return this.localStorageService; // Default to local if no valid provider is found
    }
  }
}
