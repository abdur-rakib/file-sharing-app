import { Injectable, NestMiddleware, ForbiddenException } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { DatabaseService } from "../database/database.service";
import { ConfigService } from "@nestjs/config";
import { IAppConfig } from "src/config/config.interface";

@Injectable()
export class IpTrafficMiddleware implements NestMiddleware {
  constructor(
    private readonly dbService: DatabaseService,
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

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const usageStmt = this.dbService.connection.prepare(`
      SELECT * FROM ip_usage WHERE ip = ? AND date = ?
    `);
    let usage = usageStmt.get(ip, today);

    const { maxDownloadBytesPerIp, maxUploadBytesPerIp } =
      this.configService.get<IAppConfig>("app");

    const maxLimit = isUpload ? maxUploadBytesPerIp : maxDownloadBytesPerIp;

    if (!usage) {
      this.dbService.connection
        .prepare(
          `INSERT INTO ip_usage (ip, date, uploadBytes, downloadBytes) VALUES (?, ?, 0, 0)`
        )
        .run(ip, today);
      usage = { uploadBytes: 0, downloadBytes: 0 };
    }

    const current = usage[limitKey] || 0;

    if (current + contentLength > maxLimit) {
      throw new ForbiddenException(`Daily ${limitKey} limit exceeded`);
    }

    this.dbService.connection
      .prepare(
        `UPDATE ip_usage SET ${limitKey} = ${limitKey} + ? WHERE ip = ? AND date = ?`
      )
      .run(contentLength, ip, today);

    next();
  }
}
