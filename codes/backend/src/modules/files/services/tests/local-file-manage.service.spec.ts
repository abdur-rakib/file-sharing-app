import { CustomLogger } from "src/shared/services/custom-logger.service";
import { FileMetadataService } from "../files-metadata.service";
import { LocalFileManageService } from "../local-file-storage.service";

describe("LocalFileManageService", () => {
  let service: LocalFileManageService;
  let fileMetadataService: jest.Mocked<FileMetadataService>;
  let customLogger: jest.Mocked<CustomLogger>;

  beforeEach(() => {
    fileMetadataService = {
      saveFileMetadata: jest.fn(),
    } as unknown as jest.Mocked<FileMetadataService>;
    customLogger = {
      warn: jest.fn(),
      error: jest.fn(),
      setContext: jest.fn(),
    } as unknown as jest.Mocked<CustomLogger>;

    service = new LocalFileManageService(fileMetadataService, customLogger);
  });

  it("should call fileMetadataService.saveFileMetadata and return the result", () => {
    // Arrange
    const mockFile = {
      filename: "test.txt",
      path: "uploads/test.txt",
      mimetype: "text/plain",
      size: 1234,
    } as Express.Multer.File;
    const ip = "127.0.0.1";
    const mockResult = {
      filename: "test.txt",
      path: "uploads/test.txt",
      mimetype: "text/plain",
      publicKey: "mock-uuid",
      privateKey: "mock-uuid",
      uploadedAt: expect.any(String),
      lastAccessedAt: expect.any(String),
    };

    // Act
    fileMetadataService.saveFileMetadata.mockReturnValue(mockResult);
    const result = service.upload(mockFile, ip);

    // Assert
    expect(fileMetadataService.saveFileMetadata).toHaveBeenCalledWith(
      mockFile,
      ip
    );
    expect(result).toEqual(mockResult);
  });
});
