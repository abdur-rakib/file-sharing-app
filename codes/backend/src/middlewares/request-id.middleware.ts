import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestContextService } from 'src/shared/services/request-context.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  constructor(private readonly requestContextService: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const context = new Map<string, any>();
    const requestId = req?.headers['x-request-id'] || uuidv4();

    context.set('requestId', requestId);

    this.requestContextService.run(() => {
      this.requestContextService.set('requestId', requestId);
      next();
    }, context);
  }
}
