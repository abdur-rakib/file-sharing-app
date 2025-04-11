import { MiddlewareConsumer, Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SharedModule } from "./shared/shared.module";
import { HttpLoggerMiddleware } from "./middlewares/http-logger.middleware";
import { RequestIdMiddleware } from "./middlewares/request-id.middleware";
import { FilesModule } from "./modules/files/files.module";
import { DatabaseService } from "./database/database.service";
import { ConfigModule } from "@nestjs/config";
import { appConfig } from "./config/config";

@Module({
  imports: [
    SharedModule,
    FilesModule,
    // ConfigModule.forRoot({
    //   isGlobal: true, // Makes the config module available globally
    //   load: [appConfig], // Load custom configuration files
    // }),
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
  exports: [DatabaseService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes("*");
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
