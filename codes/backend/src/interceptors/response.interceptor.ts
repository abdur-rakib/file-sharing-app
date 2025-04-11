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
    return next.handle().pipe(
      map((data: IControllerResult) => ({
        status: EStatusType.SUCCESS,
        statusCode: context.switchToHttp().getResponse().statusCode,
        message: data.message || "Request was successful",
        data: data.data || data,
      }))
    );
  }
}
