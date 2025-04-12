export interface IFile {
  filename: string;
  path: string;
  mimetype: string;
  public_key: string;
  private_key: string;
  uploaded_at: string;
}

export interface IFileUploadService {
  upload(file: Express.Multer.File, ip: string): Promise<any>;
}
