import { Injectable, NestMiddleware, ForbiddenException } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { ConfigService } from "@nestjs/config";
import { IAppConfig } from "src/config/config.interface";
import { IpUsageRepository } from "src/modules/files/repositories/ip-usage.repository";
import { getToday } from "src/common/utils/date.utils";

@Injectable()
export class IpTrafficMiddleware implements NestMiddleware {
  constructor(
    private readonly ipUsageRepo: IpUsageRepository,
    private readonly configService: ConfigService
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip;
    const isUpload =
      req.method === "POST" && req.originalUrl.startsWith("/api/v1/files");
    const isDownload =
      req.method === "GET" && req.originalUrl.startsWith("/api/v1/files");

    if (!isUpload && !isDownload) return next();

    const limitKey = isUpload ? "uploadBytes" : "downloadBytes";
    const contentLength = parseInt(req.headers["content-length"] || "0", 10);

    const today = getToday();

    let usage = this.ipUsageRepo.getIpUsage(ip, today);

    const { maxDownloadBytesPerIp, maxUploadBytesPerIp } =
      this.configService.get<IAppConfig>("app");

    const maxLimit = isUpload ? maxUploadBytesPerIp : maxDownloadBytesPerIp;

    if (!usage) {
      // If no usage record exists for today, create one
      this.ipUsageRepo.createIpUsage(ip, today);
      usage = { uploadBytes: 0, downloadBytes: 0 };
    }

    const current = usage[limitKey] || 0;

    if (current + contentLength > maxLimit) {
      throw new ForbiddenException(`Daily ${limitKey} limit exceeded`);
    }

    next();
  }
}
