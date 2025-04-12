import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../../database/database.service";

@Injectable()
export class IpUsageRepository {
  constructor(private readonly dbService: DatabaseService) {}

  updateIpUsage(
    ip: string,
    contentLength: number,
    isUpload: boolean,
    date: string
  ) {
    const column = isUpload ? "uploadBytes" : "downloadBytes";

    const updateStmt = this.dbService.connection.prepare(
      `UPDATE ip_usage SET ${column} = ${column} + ? WHERE ip = ? AND date = ?`
    );
    updateStmt.run(contentLength, ip, date);
  }

  getIpUsage(ip: string, date: string) {
    const queryStmt = this.dbService.connection.prepare(
      `SELECT * FROM ip_usage WHERE ip = ? AND date = ?`
    );
    return queryStmt.get(ip, date);
  }

  createIpUsage(ip: string, date: string) {
    const insertStmt = this.dbService.connection.prepare(
      `INSERT INTO ip_usage (ip, date, uploadBytes, downloadBytes) VALUES (?, ?, 0, 0)`
    );
    insertStmt.run(ip, date);
  }
}
