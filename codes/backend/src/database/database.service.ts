import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import * as Database from "better-sqlite3";
import * as path from "path";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db: Database.Database;

  onModuleInit() {
    const dbPath = path.resolve(__dirname, "../../data/files.db");
    this.db = new Database(dbPath);
    this.initializeTables();
  }

  onModuleDestroy() {
    this.db?.close();
  }

  private initializeTables() {
    const createFilesTableSQL = `
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT,
        path TEXT,
        mimetype TEXT,
        public_key TEXT UNIQUE,
        private_key TEXT UNIQUE,
        uploaded_at TEXT
      );
    `;

    const createIpUsageTableSQL = `
      CREATE TABLE IF NOT EXISTS ip_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip TEXT,
        date TEXT,
        uploadBytes INTEGER DEFAULT 0,
        downloadBytes INTEGER DEFAULT 0,
        UNIQUE(ip, date)
      );
    `;

    this.db.prepare(createFilesTableSQL).run();
    this.db.prepare(createIpUsageTableSQL).run();
  }

  get connection() {
    return this.db;
  }
}
