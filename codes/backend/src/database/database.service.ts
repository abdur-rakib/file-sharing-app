import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import Database from "better-sqlite3";
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
    const createTableSQL = `
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

    const createPublicKeyIndex = `
    CREATE UNIQUE INDEX IF NOT EXISTS idx_files_public_key ON files(public_key);
  `;

    const createPrivateKeyIndex = `
    CREATE UNIQUE INDEX IF NOT EXISTS idx_files_private_key ON files(private_key);
  `;

    this.db.prepare(createTableSQL).run();
    this.db.prepare(createPublicKeyIndex).run();
    this.db.prepare(createPrivateKeyIndex).run();
  }

  get connection() {
    return this.db;
  }
}
