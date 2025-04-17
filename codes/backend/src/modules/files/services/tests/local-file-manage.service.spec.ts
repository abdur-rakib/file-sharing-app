import { LocalFileManageService } from "../local-file-manage.service";
import { FilesService } from "../files.service";
import { CustomLogger } from "src/shared/services/custom-logger.service";

describe("LocalFileManageService", () => {
  let service: LocalFileManageService;
  let filesService: jest.Mocked<FilesService>;
  let customLogger: jest.Mocked<CustomLogger>;

  beforeEach(() => {
    filesService = {
      uploadFile: jest.fn(),
    } as unknown as jest.Mocked<FilesService>;
    customLogger = {
      uploadFile: jest.fn(),
    } as unknown as jest.Mocked<CustomLogger>;

    service = new LocalFileManageService(filesService, customLogger);
  });

  it("should call filesService.uploadFile and return the result", () => {
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
    };

    // Act
    filesService.uploadFile.mockReturnValue(mockResult);
    const result = service.upload(mockFile, ip);

    // Assert
    expect(filesService.uploadFile).toHaveBeenCalledWith(mockFile, ip);
    expect(result).toEqual(mockResult);
  });
});
