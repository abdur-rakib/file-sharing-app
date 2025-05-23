import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as Database from "better-sqlite3";
import * as fs from "fs";
import * as path from "path";
import { DbConnectivity } from "../common/enums/logging-tag.enum";
import { IDBConfig } from "../config/config.interface";
import { CustomLogger } from "../shared/services/custom-logger.service";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly logger: CustomLogger,
    private readonly configService: ConfigService
  ) {
    this.logger.setContext(DatabaseService.name);
  }
  private db: Database.Database;

  onModuleInit() {
    const dbPath = this.getDatabasePath();
    this.db = new Database(dbPath);
    this.logger.log(
      DbConnectivity.DB_CONNECTIVITY,
      `Database initialized at ${dbPath}`
    );
    this.initializeTables();
  }

  onModuleDestroy() {
    this.db?.close();
    this.logger.log(
      DbConnectivity.DB_CONNECTIVITY,
      "Database connection closed"
    );
  }

  private getDatabasePath(): string {
    const relativePath = this.configService.get<IDBConfig>("db").dbRelativePath;
    const fullPath = path.resolve(process.cwd(), relativePath);

    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    return fullPath;
  }

  private initializeTables() {
    try {
      this.db.prepare(CREATE_FILES_TABLE_SQL).run();
      this.db.prepare(CREATE_IP_USAGE_TABLE_SQL).run();
      this.logger.log(
        DbConnectivity.DB_CONNECTIVITY,
        "Database tables initialized"
      );
    } catch (error) {
      this.logger.error(
        DbConnectivity.DB_CONNECTIVITY,
        "Failed to initialize database tables",
        error
      );
      throw error;
    }
  }

  // getting connection as a getter property
  get connection(): Database.Database {
    return this.db;
  }
}

// SQL constants for readability and reuse
const CREATE_FILES_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT,
    path TEXT,
    mimetype TEXT,
    publicKey TEXT UNIQUE,
    privateKey TEXT UNIQUE,
    uploadedAt TEXT,
    lastAccessedAt TEXT
  );
`;

const CREATE_IP_USAGE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS ip_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT,
    date TEXT,
    uploadBytes INTEGER DEFAULT 0,
    downloadBytes INTEGER DEFAULT 0,
    UNIQUE(ip, date)
  );
`;
