export interface IFile {
  filename: string;
  path: string;
  mimetype: string;
  publicKey: string;
  privateKey: string;
  uploadedAt: string;
}

export interface IFileUploadService {
  upload(file: Express.Multer.File, ip: string): Promise<any>;
}
