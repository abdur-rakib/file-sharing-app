export interface IFile {
  filename: string;
  path: string;
  mimetype: string;
  publicKey: string;
  privateKey: string;
  uploadedAt: string;
  lastAccessedAt: string;
}

export interface IFileManageService {
  upload(file: Express.Multer.File, ip: string): Promise<any>;
}
