import { ReadStream } from "fs";

/**
 * File storage metadata object
 */
export interface IStorageFile extends Partial<Express.Multer.File> {
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  publicKey?: string;
  privateKey?: string;
  stream?: ReadStream;
}

/**
 * Storage interface for file operations
 * All storage providers must implement this interface
 */
export interface IStorageProvider {
  /**
   * Save a file to storage
   * @param file The file to save
   * @returns Storage metadata
   */
  saveFile(file: Express.Multer.File): Promise<IStorageFile>;

  /**
   * Get a file from storage
   * @param path The file path
   * @returns File stream and metadata
   */
  getFile(path: string): Promise<IStorageFile>;

  /**
   * Delete a file from storage
   * @param path The file path
   * @returns Whether deletion was successful
   */
  deleteFile(path: string): Promise<boolean>;

  /**
   * Check if a file exists
   * @param path The file path
   * @returns Whether the file exists
   */
  fileExists(path: string): Promise<boolean>;
}
