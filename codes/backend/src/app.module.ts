import { MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { appConfig, dbConfig } from "./config/config";
import { HttpLoggerMiddleware } from "./middlewares/http-logger.middleware";
import { IpTrafficMiddleware } from "./middlewares/ip-traffic.middleware";
import { RequestIdMiddleware } from "./middlewares/request-id.middleware";
import { FilesModule } from "./modules/files/files.module";
import { IpUsageRepository } from "./modules/files/repositories/ip-usage.repository";
import { SharedModule } from "./shared/shared.module";

@Module({
  imports: [
    SharedModule,
    FilesModule,
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config module available globally
      load: [appConfig, dbConfig], // Load custom configuration files
    }),
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
