import { LoggerService } from "@nestjs/common";
import { RequestContextService } from "./request-context.service";
interface LogPayload {
    metadata?: Record<string, any>;
    [key: string]: any;
}
export declare class CustomLogger implements LoggerService {
    private readonly requestContextService;
    private readonly env;
    private readonly enabledLogLevels;
    private context;
    constructor(requestContextService: RequestContextService);
    setContext(context: string): void;
    private formatMessage;
    private isLogLevelEnabled;
    log(tag: string, message: string, payload?: LogPayload): void;
    error(tag: string, message: string, payload?: LogPayload): void;
    warn(tag: string, message: string, payload?: LogPayload): void;
    debug(tag: string, message: string, payload?: LogPayload): void;
    verbose(tag: string, message: string, payload?: LogPayload): void;
}
export {};
