import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { CustomLogger } from "./shared/services/custom-logger.service";
import { RequestContextService } from "./shared/services/request-context.service";
import { Logger, ValidationPipe, VersioningType } from "@nestjs/common";
import { HttpExceptionFilter } from "./filters/http-exception.filter";
import { setupSwagger } from "./setup-swagger";
import { ResponseInterceptor } from "./interceptors/response.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const contextService = app.get(RequestContextService);
  const customLogger = new CustomLogger(contextService);

  app.useLogger(customLogger); // Replace the default logger with the custom logger

  app.enableCors();
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: "api/",
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    })
  );

  setupSwagger(app);

  await app.listen(3000, () => {
    Logger.log("Application is running on: http://localhost:3000");
  });
}
bootstrap();
