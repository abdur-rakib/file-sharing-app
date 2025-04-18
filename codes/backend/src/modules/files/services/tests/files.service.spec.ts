import { NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { CustomLogger } from "../../../../shared/services/custom-logger.service";
import { FilesRepository } from "../../repositories/files.repository";
import { IpUsageRepository } from "../../repositories/ip-usage.repository";
import { FileManageFactory } from "../file-manage.factory";
import { FileMetadataService } from "../files-metadata.service";
import { FilesService } from "../files.service";

// Mock better-sqlite3 to prevent real DB calls in tests
jest.mock("better-sqlite3", () => {
  return {
    Database: jest.fn().mockReturnValue({
      prepare: jest.fn().mockReturnThis(),
      run: jest.fn(),
      all: jest.fn(),
    }),
  };
});

// Mocking the uuid module to return a fixed UUID
jest.mock("uuid", () => ({
  v4: jest.fn().mockReturnValue("mock-uuid"),
}));

// Mocking the date utility to return a fixed date
jest.mock("../../../../common/utils/date.utils.ts", () => ({
  getToday: jest.fn(() => "2025-04-10"),
}));

// Mock fs module methods
jest.mock("fs", () => ({
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

describe("FilesService", () => {
  let service: FilesService;
  let filesRepo: jest.Mocked<FilesRepository>;
  let ipUsageRepo: jest.Mocked<IpUsageRepository>;
  let fileMetadataService: jest.Mocked<FileMetadataService>;

  let mockFile;
  let privateKey: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: FilesRepository,
          useValue: {
            save: jest.fn(),
            findByPublicKey: jest.fn(),
            findByPrivateKey: jest.fn(),
            deleteByPrivateKey: jest.fn(),
          },
        },
        {
          provide: IpUsageRepository,
          useValue: {
            updateIpUsage: jest.fn(),
          },
        },
        {
          provide: FileManageFactory,
          useValue: {
            getService: jest.fn().mockReturnValue({
              delete: jest.fn(),
            }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue("local"),
          },
        },
        {
          provide: FileMetadataService,
          useValue: {
            saveFileMetadata: jest.fn().mockReturnValue({
              publicKey: "mock-uuid",
              privateKey: "mock-uuid",
            }),
          },
        },
        {
          provide: CustomLogger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    filesRepo = module.get(FilesRepository);
    ipUsageRepo = module.get(IpUsageRepository);
    fileMetadataService = module.get(FileMetadataService);

    mockFile = {
      filename: "test.txt",
      mimetype: "text/plain",
      size: 1234,
      path: "uploads/test.txt",
      publicKey: "some-public-key",
      privateKey: "some-private-key",
      uploadedAt: "2025-04-10T00:00:00.000Z",
      lastAccessedAt: "2025-04-10T00:00:00.000Z",
    };

    privateKey = "some-private-key";

    jest.clearAllMocks();
  });
  describe("getFileByPublicKey", () => {
    it("should return file by public key", () => {
      filesRepo.findByPublicKey.mockReturnValue(mockFile);

      const result = service.getFileByPublicKey("some-public-key");

      expect(result).toBe(mockFile);
      expect(filesRepo.findByPublicKey).toHaveBeenCalledWith("some-public-key");
    });
  });
  describe("deleteFileByPrivateKey", () => {
    it("should delete file by private key and remove metadata", async () => {
      // Arrange
      filesRepo.findByPrivateKey.mockReturnValue(mockFile);

      // Act
      await service.deleteFileByPrivateKey(privateKey);

      // Assert
      expect(filesRepo.deleteByPrivateKey).toHaveBeenCalledWith(privateKey);
    });

    it("should throw NotFoundException if file not found", async () => {
      filesRepo.findByPrivateKey.mockReturnValue(undefined);

      await expect(service.deleteFileByPrivateKey(privateKey)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("updateIpUsage", () => {
    it("should call updateIpUsage in repo with correct args", () => {
      const updateIpUsageArgs = {
        ip: "1.2.3.4",
        size: 1000,
        isUpload: true,
      };

      service.updateIpUsage(
        updateIpUsageArgs.ip,
        updateIpUsageArgs.size,
        updateIpUsageArgs.isUpload
      );

      expect(ipUsageRepo.updateIpUsage).toHaveBeenCalledWith(
        updateIpUsageArgs.ip,
        updateIpUsageArgs.size,
        updateIpUsageArgs.isUpload,
        "2025-04-10"
      );
    });
  });
});
