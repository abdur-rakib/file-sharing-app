import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { HttpLogger } from "../common/enums/logging-tag.enum";
import { CustomLogger } from "../shared/services/custom-logger.service";

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: CustomLogger) {
    logger.setContext(HttpLoggerMiddleware.name);
  }
  private isErroneousStatusCode(statusCode: number) {
    return statusCode >= 400 && statusCode < 600;
  }

  use(req: Request, res: Response, next: NextFunction) {
    const {
      ip,
      method,
      body,
      originalUrl,
      statusMessage,
      hostname,
      query,
      params,
      headers,
    } = req;
    const user_agent = req.get("user-agent") || "";
    const referer = req.get("referer") || "";
    // request start time
    const req_start = Date.now();

    let responseBody = "";

    // Override `res.write` to capture chunks of data
    const originalWrite = res.write.bind(res);
    res.write = (chunk: any, ...args: any[]) => {
      responseBody += chunk;
      return originalWrite(chunk, ...args);
    };

    // Override `res.end` to capture the final chunk of data
    const originalEnd = res.end.bind(res);
    res.end = (chunk: any, ...args: any[]) => {
      if (chunk) {
        responseBody += chunk;
      }
      return originalEnd(chunk, ...args);
    };

    res.on("finish", () => {
      const { statusCode } = res;
      const content_length = res.get("content-length");
      //   convert diff in to seconds
      const request_time = (Date.now() - req_start) / 1000;

      let parsedResponseBody: string;
      try {
        parsedResponseBody = JSON.parse(responseBody);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        parsedResponseBody = responseBody; // Fallback to raw response if parsing fails
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

        this.logger.log(HttpLogger.HTTP_REQUEST, "Request Failed", {
          ...basicRequestMetaInfo,
          ...additionalRequestMetaInfo,
        });
      } else {
        this.logger.log(HttpLogger.HTTP_REQUEST, "Request Success", {
          ...basicRequestMetaInfo,
        });
      }
    });
    next();
  }
}
