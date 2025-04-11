import { MiddlewareConsumer, Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SharedModule } from "./shared/shared.module";
import { HttpLoggerMiddleware } from "./middlewares/http-logger.middleware";
import { RequestIdMiddleware } from "./middlewares/request-id.middleware";
import { FilesModule } from "./modules/files/files.module";
import { DatabaseService } from "./database/database.service";

@Module({
  imports: [SharedModule, FilesModule],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
  exports: [DatabaseService],
})
// Import necessary modules and middleware
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes("*");
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
