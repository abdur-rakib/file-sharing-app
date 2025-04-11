"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const custom_logger_service_1 = require("./shared/services/custom-logger.service");
const request_context_service_1 = require("./shared/services/request-context.service");
const common_1 = require("@nestjs/common");
const http_exception_filter_1 = require("./filters/http-exception.filter");
const setup_swagger_1 = require("./setup-swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: false,
    });
    const contextService = app.get(request_context_service_1.RequestContextService);
    const customLogger = new custom_logger_service_1.CustomLogger(contextService);
    app.useLogger(customLogger);
    app.enableCors();
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.enableVersioning({
        type: common_1.VersioningType.URI,
        prefix: "api/",
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
    }));
    (0, setup_swagger_1.setupSwagger)(app);
    await app.listen(3000, () => {
        common_1.Logger.log("Application is running on: http://localhost:3000");
    });
}
bootstrap();
//# sourceMappingURL=main.js.map