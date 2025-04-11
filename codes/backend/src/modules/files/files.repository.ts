import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { IFile } from "./interfaces/files.interface";

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
}
