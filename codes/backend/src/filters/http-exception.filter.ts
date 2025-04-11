import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { statusType } from "src/common/constants/status-type";

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
      status: statusType.FAILED,
      code: status,
      // message: HttpExceptionMessage[status],
      reason: exception.response?.message || exception.message,
      message: exception.response?.message || exception.message,
    };

    response.status(status).json(errorResponse);
  }
}
