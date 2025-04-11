import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { httpExceptionMessage } from "src/common/constants/http-exception-message";
import { EStatusType } from "src/common/enums/response.enum";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      status: EStatusType.FAILED,
      code: status,
      message: httpExceptionMessage[status],
      reason: exception.response?.message || exception.message,
    };

    response.status(status).json(errorResponse);
  }
}
