import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLogger } from 'src/shared/services/custom-logger.service';
export declare class HttpLoggerMiddleware implements NestMiddleware {
    private readonly logger;
    constructor(logger: CustomLogger);
    private isErroneousStatusCode;
    use(req: Request, res: Response, next: NextFunction): void;
}
