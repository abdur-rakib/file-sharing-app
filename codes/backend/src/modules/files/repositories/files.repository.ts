import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { IFile } from "../interfaces/files.interface";

@Injectable()
export class FilesRepository {
  constructor(private readonly dbService: DatabaseService) {}

  save(file: IFile): void {
    const queryStatement = this.dbService.connection.prepare(`
      INSERT INTO files (filename, path, mimetype, public_key, private_key, uploaded_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    queryStatement.run(
      file.filename,
      file.path,
      file.mimetype,
      file.public_key,
      file.private_key,
      file.uploaded_at
    );
  }

  findByPublicKey(publicKey: string) {
    const queryStatement = this.dbService.connection.prepare(`
      SELECT * FROM files WHERE public_key = ?
    `);
    return queryStatement.get(publicKey);
  }

  deleteByPrivateKey(privateKey: string) {
    const getStmt = this.dbService.connection.prepare(`
      SELECT * FROM files WHERE private_key = ?
    `);
    const file = getStmt.get(privateKey);

    if (!file) return null;

    const delStmt = this.dbService.connection.prepare(`
      DELETE FROM files WHERE private_key = ?
    `);
    delStmt.run(privateKey);

    return file;
  }
}
