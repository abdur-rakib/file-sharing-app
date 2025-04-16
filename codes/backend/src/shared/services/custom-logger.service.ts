import { Injectable, LoggerService, Scope } from "@nestjs/common";
import { RequestContextService } from "./request-context.service";

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLogger implements LoggerService {
  private readonly env: string;
  private context: string = "Application";

  constructor(private readonly requestContextService: RequestContextService) {
    this.env = process.env.NODE_ENV || "development";
  }

  setContext(context: string) {
    this.context = context;
  }

  private formatMessage(
    level: string,
    message: any,
    ...optionalParams: any[]
  ): string {
    const requestId = this.requestContextService.get("requestId");

    const logEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      environment: this.env,
      context: this.context,
      request_id: requestId,
      metadata: optionalParams.length ? optionalParams : undefined,
    };

    return JSON.stringify(logEntry);
  }

  // Implement required LoggerService methods
  log(message: any, ...optionalParams: any[]) {
    console.log(this.formatMessage("info", message, ...optionalParams));
  }

  error(message: any, ...optionalParams: any[]) {
    console.error(this.formatMessage("error", message, ...optionalParams));
  }

  warn(message: any, ...optionalParams: any[]) {
    console.warn(this.formatMessage("warn", message, ...optionalParams));
  }

  debug(message: any, ...optionalParams: any[]) {
    if (this.env === "development") {
      console.debug(this.formatMessage("debug", message, ...optionalParams));
    }
  }

  verbose(message: any, ...optionalParams: any[]) {
    if (this.env === "development") {
      console.log(this.formatMessage("verbose", message, ...optionalParams));
    }
  }

  // Add support for NestJS fatal errors
  fatal(message: any, ...optionalParams: any[]) {
    console.error(this.formatMessage("fatal", message, ...optionalParams));
  }
}
