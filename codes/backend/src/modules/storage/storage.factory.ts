import { Injectable } from "@nestjs/common";
import { LocalStorageProvider } from "./providers/local-storage.provider";
import { IStorageProvider } from "./interfaces/storage.interface";
import { GoogleStorageProvider } from "./providers/google-storage.provider";

@Injectable()
export class StorageFactory {
  constructor(
    private readonly localStorageProvider: LocalStorageProvider,
    private readonly googleStorageProvider: GoogleStorageProvider
  ) {}

  getService(provider: "local" | "google"): IStorageProvider {
    switch (provider) {
      case "google":
        return this.googleStorageProvider;
      case "local":
        return this.localStorageProvider;
      default:
        return this.localStorageProvider; // Default to local if no valid provider is found
    }
  }
}
