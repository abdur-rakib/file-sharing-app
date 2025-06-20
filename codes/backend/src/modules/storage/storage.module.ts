import { Module } from "@nestjs/common";
import { StorageService } from "./storage.service";
import { StorageFactory } from "./storage.factory";
import { LocalStorageProvider } from "./providers/local-storage.provider";
import { GoogleStorageProvider } from "./providers/google-storage.provider";

@Module({
  providers: [
    StorageService,
    StorageFactory,
    LocalStorageProvider,
    GoogleStorageProvider,
  ],
  exports: [StorageService],
})
export class StorageModule {}
