"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var HttpLoggerMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpLoggerMiddleware = void 0;
const common_1 = require("@nestjs/common");
const logging_tag_enum_1 = require("../common/enums/logging-tag.enum");
const custom_logger_service_1 = require("../shared/services/custom-logger.service");
let HttpLoggerMiddleware = HttpLoggerMiddleware_1 = class HttpLoggerMiddleware {
    constructor(logger) {
        this.logger = logger;
        logger.setContext(HttpLoggerMiddleware_1.name);
    }
    isErroneousStatusCode(statusCode) {
        return statusCode >= 400 && statusCode < 600;
    }
    use(req, res, next) {
        const { ip, method, body, originalUrl, statusMessage, hostname, query, params, headers, } = req;
        const user_agent = req.get('user-agent') || '';
        const referer = req.get('referer') || '';
        const req_start = Date.now();
        let responseBody = '';
        const originalWrite = res.write.bind(res);
        res.write = (chunk, ...args) => {
            responseBody += chunk;
            return originalWrite(chunk, ...args);
        };
        const originalEnd = res.end.bind(res);
        res.end = (chunk, ...args) => {
            if (chunk) {
                responseBody += chunk;
            }
            return originalEnd(chunk, ...args);
        };
        res.on('finish', () => {
            const { statusCode } = res;
            const content_length = res.get('content-length');
            const request_time = (Date.now() - req_start) / 1000;
            let parsedResponseBody;
            try {
                parsedResponseBody = JSON.parse(responseBody);
            }
            catch (e) {
                parsedResponseBody = responseBody;
            }
            const basicRequestMetaInfo = {
                ip,
                method,
                request_url: originalUrl,
                user_agent,
                status_code: statusCode,
                content_length,
                status_message: statusMessage,
                referer,
                host_name: hostname,
                request_time,
                response_body: parsedResponseBody,
            };
            if (this.isErroneousStatusCode(statusCode)) {
                const additionalRequestMetaInfo = {
                    body,
                    query,
                    params,
                    headers,
                };
                this.logger.log(logging_tag_enum_1.HttpLogger.HTTP_REQUEST, 'Request Failed', {
                    ...basicRequestMetaInfo,
                    ...additionalRequestMetaInfo,
                });
            }
            else {
                this.logger.log(logging_tag_enum_1.HttpLogger.HTTP_REQUEST, 'Request Success', {
                    ...basicRequestMetaInfo,
                });
            }
        });
        next();
    }
};
exports.HttpLoggerMiddleware = HttpLoggerMiddleware;
exports.HttpLoggerMiddleware = HttpLoggerMiddleware = HttpLoggerMiddleware_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [custom_logger_service_1.CustomLogger])
], HttpLoggerMiddleware);
//# sourceMappingURL=http-logger.middleware.js.map