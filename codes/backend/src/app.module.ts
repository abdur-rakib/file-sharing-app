import { MiddlewareConsumer, Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SharedModule } from "./shared/shared.module";
import { HttpLoggerMiddleware } from "./middlewares/http-logger.middleware";
import { RequestIdMiddleware } from "./middlewares/request-id.middleware";

@Module({
  imports: [SharedModule],
  controllers: [AppController],
  providers: [AppService],
})
// Import necessary modules and middleware
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes("*");
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
