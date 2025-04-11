import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { FilesRepository } from "./files.repository";

@Injectable()
export class FilesService {
  constructor(private readonly filesRepo: FilesRepository) {}
  uploadFile(file: Express.Multer.File) {
    const public_key = uuidv4();
    const private_key = uuidv4();

    // construct the file data object
    // using the file information and the generated keys
    const fileData = {
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      public_key,
      private_key,
      uploaded_at: new Date().toISOString(),
    };

    // save the file data to the database
    this.filesRepo.save(fileData);

    // return the public and private keys
    return { public_key, private_key };
  }
}
