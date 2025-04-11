import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import Database from "better-sqlite3";
import * as path from "path";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db: Database.Database;

  onModuleInit() {
    const dbPath = path.resolve(__dirname, "../../data/metadata.db");
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
    this.db.prepare(createTableSQL).run();
  }

  get connection() {
    return this.db;
  }
}
