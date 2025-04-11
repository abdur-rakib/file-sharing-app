import { Injectable, LoggerService, Scope } from "@nestjs/common";
import { RequestContextService } from "./request-context.service";

// Define the structure for log entries
interface LogPayload {
  metadata?: Record<string, any>;
  [key: string]: any; // Index signature for additional properties
}

enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  LOG = "log",
  DEBUG = "debug",
  VERBOSE = "verbose",
}

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLogger implements LoggerService {
  private readonly env: string;
  private readonly enabledLogLevels: LogLevel[];
  private context: string = "Application";

  constructor(private readonly requestContextService: RequestContextService) {
    this.env = process.env.NODE_ENV || "development";

    // Define enabled log levels (can also load from a config service)
    this.enabledLogLevels = process.env.LOG_LEVELS?.split(",").map(
      (level) => level.trim() as LogLevel
    ) || [LogLevel.ERROR, LogLevel.WARN, LogLevel.LOG];

    if (this.env === "development") {
      this.enabledLogLevels.push(LogLevel.DEBUG, LogLevel.VERBOSE);
    }
  }

  setContext(context: string) {
    this.context = context;
  }

  private formatMessage(
    tag: string,
    message: string,
    payload: LogPayload = {}
  ): string {
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

  private isLogLevelEnabled(level: LogLevel): boolean {
    return this.enabledLogLevels.includes(level);
  }

  log(tag: string, message: string, payload: LogPayload = {}) {
    if (this.isLogLevelEnabled(LogLevel.LOG)) {
      const formattedMessage = this.formatMessage(tag, message, payload);
      console.log(formattedMessage);
    }
  }

  error(tag: string, message: string, payload: LogPayload = {}) {
    if (this.isLogLevelEnabled(LogLevel.ERROR)) {
      const formattedMessage = this.formatMessage(tag, message, payload);
      console.error(formattedMessage);
    }
  }

  warn(tag: string, message: string, payload: LogPayload = {}) {
    if (this.isLogLevelEnabled(LogLevel.WARN)) {
      const formattedMessage = this.formatMessage(tag, message, payload);
      console.warn(formattedMessage);
    }
  }

  debug(tag: string, message: string, payload: LogPayload = {}) {
    if (this.isLogLevelEnabled(LogLevel.DEBUG)) {
      const formattedMessage = this.formatMessage(tag, message, payload);
      console.debug(formattedMessage);
    }
  }

  verbose(tag: string, message: string, payload: LogPayload = {}) {
    if (this.isLogLevelEnabled(LogLevel.VERBOSE)) {
      const formattedMessage = this.formatMessage(tag, message, payload);
      console.log(formattedMessage);
    }
  }
}
