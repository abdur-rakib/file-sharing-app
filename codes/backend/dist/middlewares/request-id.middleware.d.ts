import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestContextService } from 'src/shared/services/request-context.service';
export declare class RequestIdMiddleware implements NestMiddleware {
    private readonly requestContextService;
    constructor(requestContextService: RequestContextService);
    use(req: Request, res: Response, next: NextFunction): void;
}
