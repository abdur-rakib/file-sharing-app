import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../../database/database.service";
import { IFile } from "../interfaces/files.interface";

@Injectable()
export class FilesRepository {
  constructor(private readonly dbService: DatabaseService) {}

  save(file: IFile): void {
    const queryStatement = this.dbService.connection.prepare(`
      INSERT INTO files (filename, path, mimetype, publicKey, privateKey, uploadedAt, lastAccessedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    queryStatement.run(
      file.filename,
      file.path,
      file.mimetype,
      file.publicKey,
      file.privateKey,
      file.uploadedAt,
      file.lastAccessedAt
    );
  }

  findByPublicKey(publicKey: string) {
    const queryStatement = this.dbService.connection.prepare(`
      SELECT * FROM files WHERE publicKey = ?
    `);
    return queryStatement.get(publicKey);
  }

  findByPrivateKey(privateKey: string) {
    const queryStatement = this.dbService.connection.prepare(`
      SELECT * FROM files WHERE privateKey = ?
    `);
    return queryStatement.get(privateKey);
  }

  deleteByPrivateKey(privateKey: string) {
    const getStmt = this.dbService.connection.prepare(`
      SELECT * FROM files WHERE privateKey = ?
    `);
    const file = getStmt.get(privateKey);

    if (!file) return null;

    const delStmt = this.dbService.connection.prepare(`
      DELETE FROM files WHERE privateKey = ?
    `);
    delStmt.run(privateKey);

    return file;
  }

  findInactiveFiles(inactivityDays: number) {
    const queryStatement = this.dbService.connection.prepare(`
      SELECT * FROM files 
      WHERE lastAccessedAt < datetime('now', '-' || ? || ' days')
    `);
    return queryStatement.all(inactivityDays);
  }
}
