import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as Database from "better-sqlite3";
import { promises as fsPromises } from "fs";
import * as path from "path";
import { DbConnectivity } from "../common/enums/logging-tag.enum";
import { IDBConfig } from "../config/config.interface";
import { CustomLogger } from "../shared/services/custom-logger.service";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db: Database.Database;
  private dbPath: string;

  constructor(
    private readonly logger: CustomLogger,
    private readonly configService: ConfigService
  ) {
    this.logger.setContext(DatabaseService.name);
  }

  async onModuleInit() {
    try {
      // Initialize database path
      this.dbPath = await this.getDatabasePath();

      this.db = new Database(this.dbPath, {
        timeout: 5000, // 5 second timeout
      });
      // Initialize tables
      await this.initializeTables();
      this.logger.log(
        DbConnectivity.DB_CONNECTIVITY,
        `Database initialized at ${this.dbPath}`
      );
    } catch (error) {
      this.logger.error(
        DbConnectivity.DB_CONNECTIVITY,
        `Failed to initialize database at ${this.dbPath}`,
        error
      );
      throw error;
    }
  }

  onModuleDestroy() {
    try {
      if (this.db) {
        this.db.close();
        this.logger.log(
          DbConnectivity.DB_CONNECTIVITY,
          "Database connection closed properly"
        );
      }
    } catch (error) {
      this.logger.error(
        DbConnectivity.DB_CONNECTIVITY,
        "Error closing database connection",
        error
      );
    }
  }

  private async getDatabasePath(): Promise<string> {
    const relativePath =
      this.configService.get<IDBConfig>("db")?.dbRelativePath;

    if (!relativePath) {
      throw new Error("Database path not configured");
    }

    const fullPath = path.resolve(process.cwd(), relativePath);
    const dir = path.dirname(fullPath);

    try {
      // Create directory if it doesn't exist (async)
      await fsPromises.mkdir(dir, { recursive: true });

      // Check if we have write permissions
      await fsPromises.access(dir, fsPromises.constants.W_OK);

      return fullPath;
    } catch (error) {
      // Handle specific error types
      if (error.code === "EACCES") {
        this.logger.error(
          DbConnectivity.DB_CONNECTIVITY,
          `Permission denied accessing database directory: ${dir}`,
          error
        );
        throw new Error(
          `Permission denied accessing database directory: ${dir}`
        );
      }

      this.logger.error(
        DbConnectivity.DB_CONNECTIVITY,
        `Error preparing database directory: ${dir}`,
        error
      );
      throw error;
    }
  }

  private async initializeTables() {
    try {
      // Use transactions for atomic table creation
      const initTransaction = this.db.transaction(() => {
        this.db.prepare(CREATE_FILES_TABLE_SQL).run();
        this.db.prepare(CREATE_IP_USAGE_TABLE_SQL).run();
      });

      // Execute the transaction
      initTransaction();

      this.logger.log(
        DbConnectivity.DB_CONNECTIVITY,
        "Database tables initialized successfully"
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

  get connection(): Database.Database {
    if (!this.db) {
      this.logger.error(
        DbConnectivity.DB_CONNECTIVITY,
        "Attempted to access database before initialization"
      );
      throw new Error("Database connection not initialized");
    }
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
