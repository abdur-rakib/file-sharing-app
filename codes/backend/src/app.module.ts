import { MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { fileConfig, dbConfig } from "./config/config";
import { HttpLoggerMiddleware } from "./middlewares/http-logger.middleware";
import { IpTrafficMiddleware } from "./middlewares/ip-traffic.middleware";
import { RequestIdMiddleware } from "./middlewares/request-id.middleware";
import { FilesModule } from "./modules/files/files.module";
import { IpUsageRepository } from "./modules/files/repositories/ip-usage.repository";
import { SharedModule } from "./shared/shared.module";
import { StorageModule } from "./modules/storage/storage.module";

@Module({
  imports: [
    SharedModule,
    FilesModule,
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config module available globally
      load: [fileConfig, dbConfig], // Load custom configuration files
    }),
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService, IpUsageRepository],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes("*");
    consumer.apply(RequestIdMiddleware).forRoutes("*");
    consumer.apply(IpTrafficMiddleware).forRoutes("/api/v1/files/");
  }
}
