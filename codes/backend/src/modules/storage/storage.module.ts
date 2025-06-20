import { Module } from "@nestjs/common";
import { GoogleStorageProvider } from "./providers/google-storage.provider";
import { LocalStorageProvider } from "./providers/local-storage.provider";
import { StorageFactory } from "./storage.factory";
import { StorageService } from "./storage.service";

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
