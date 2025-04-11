import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable, map } from "rxjs";
import { EStatusType } from "src/common/enums/response.enum";
import { IControllerResult } from "src/common/interfaces/controller-result.interface";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data: any) => {
        // If response is already sent (e.g., stream/download), skip wrapping
        if (response.headersSent) return data;

        // Try to format structured responses
        const result: IControllerResult =
          typeof data === "object" && data?.data !== undefined
            ? data
            : { message: "Request was successful", data };

        return {
          status: EStatusType.SUCCESS,
          statusCode: response.statusCode,
          message: result.message,
          data: result.data,
        };
      })
    );
  }
}
