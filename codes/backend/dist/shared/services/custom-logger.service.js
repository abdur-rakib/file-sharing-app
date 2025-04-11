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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomLogger = void 0;
const common_1 = require("@nestjs/common");
const request_context_service_1 = require("./request-context.service");
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["LOG"] = "log";
    LogLevel["DEBUG"] = "debug";
    LogLevel["VERBOSE"] = "verbose";
})(LogLevel || (LogLevel = {}));
let CustomLogger = class CustomLogger {
    constructor(requestContextService) {
        this.requestContextService = requestContextService;
        this.context = "Application";
        this.env = process.env.NODE_ENV || "development";
        this.enabledLogLevels = process.env.LOG_LEVELS?.split(",").map((level) => level.trim()) || [LogLevel.ERROR, LogLevel.WARN, LogLevel.LOG];
        if (this.env === "development") {
            this.enabledLogLevels.push(LogLevel.DEBUG, LogLevel.VERBOSE);
        }
    }
    setContext(context) {
        this.context = context;
    }
    formatMessage(tag, message, payload = {}) {
        const requestId = this.requestContextService.get("requestId");
        const logEntry = {
            tag,
            message,
            timestamp: new Date().toString(),
            environment: this.env,
            context: this.context || "Application",
            request_id: requestId,
            metadata: payload || {},
        };
        return JSON.stringify(logEntry);
    }
    isLogLevelEnabled(level) {
        return this.enabledLogLevels.includes(level);
    }
    log(tag, message, payload = {}) {
        if (this.isLogLevelEnabled(LogLevel.LOG)) {
            const formattedMessage = this.formatMessage(tag, message, payload);
            console.log(formattedMessage);
        }
    }
    error(tag, message, payload = {}) {
        if (this.isLogLevelEnabled(LogLevel.ERROR)) {
            const formattedMessage = this.formatMessage(tag, message, payload);
            console.error(formattedMessage);
        }
    }
    warn(tag, message, payload = {}) {
        if (this.isLogLevelEnabled(LogLevel.WARN)) {
            const formattedMessage = this.formatMessage(tag, message, payload);
            console.warn(formattedMessage);
        }
    }
    debug(tag, message, payload = {}) {
        if (this.isLogLevelEnabled(LogLevel.DEBUG)) {
            const formattedMessage = this.formatMessage(tag, message, payload);
            console.debug(formattedMessage);
        }
    }
    verbose(tag, message, payload = {}) {
        if (this.isLogLevelEnabled(LogLevel.VERBOSE)) {
            const formattedMessage = this.formatMessage(tag, message, payload);
            console.log(formattedMessage);
        }
    }
};
exports.CustomLogger = CustomLogger;
exports.CustomLogger = CustomLogger = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.TRANSIENT }),
    __metadata("design:paramtypes", [request_context_service_1.RequestContextService])
], CustomLogger);
//# sourceMappingURL=custom-logger.service.js.map