import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable, map } from "rxjs";
import { EStatusType } from "src/common/enums/response.enum";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        status: EStatusType.SUCCESS,
        statusCode: context.switchToHttp().getResponse().statusCode,
        data,
      }))
    );
  }
}
