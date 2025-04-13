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

import { Test, TestingModule } from "@nestjs/testing";
import { CustomLogger } from "../../../shared/services/custom-logger.service";
import { FilesRepository } from "../repositories/files.repository";
import { IpUsageRepository } from "../repositories/ip-usage.repository";
import { FilesService } from "./files.service";
import {
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import * as fs from "fs";

// Mocking the uuid module to return a fixed UUID
jest.mock("uuid", () => ({
  v4: jest.fn().mockReturnValue("mock-uuid"),
}));

// Mocking the date utility to return a fixed date
jest.mock("../../../common/utils/date.utils", () => ({
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

    mockFile = {
      filename: "test.txt",
      mimetype: "text/plain",
      size: 1234,
      path: "uploads/test.txt",
      publicKey: "some-public-key",
      privateKey: "some-private-key",
      uploadedAt: "2025-04-10T00:00:00.000Z",
    };

    privateKey = "some-private-key";

    jest.clearAllMocks();
  });

  describe("uploadFile", () => {
    it("should save file and update IP usage", () => {
      const file = {
        filename: "test.txt",
        path: "uploads/test.txt",
        mimetype: "text/plain",
        size: 1234,
      } as Express.Multer.File;

      const result = service.uploadFile(file, "127.0.0.1");

      expect(filesRepo.save).toHaveBeenCalledWith({
        filename: "test.txt",
        path: "uploads/test.txt",
        mimetype: "text/plain",
        publicKey: "mock-uuid",
        privateKey: "mock-uuid",
        uploadedAt: expect.any(String),
      });

      expect(ipUsageRepo.updateIpUsage).toHaveBeenCalledWith(
        "127.0.0.1",
        1234,
        true,
        "2025-04-10"
      );

      expect(result).toEqual({
        publicKey: "mock-uuid",
        privateKey: "mock-uuid",
      });
    });
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
    it("should delete file by private key and remove metadata", () => {
      // Arrange
      filesRepo.findByPrivateKey.mockReturnValue(mockFile);
      (fs.existsSync as jest.Mock).mockReturnValue(true); // File exists

      // Act
      service.deleteFileByPrivateKey(privateKey);

      // Assert
      expect(filesRepo.deleteByPrivateKey).toHaveBeenCalledWith(privateKey);
      expect(fs.unlinkSync).toHaveBeenCalledWith(mockFile.path);
    });

    it("should log a warning if file does not exist during deletion", () => {
      // Arrange
      filesRepo.findByPrivateKey.mockReturnValue(mockFile);
      (fs.existsSync as jest.Mock).mockReturnValue(false); // File does not exist

      // Act
      service.deleteFileByPrivateKey(privateKey);

      // Assert
      expect(filesRepo.deleteByPrivateKey).toHaveBeenCalledWith(privateKey);
      expect(fs.unlinkSync).not.toHaveBeenCalled(); // unlink should not be called if file doesn't exist
      expect(service["logger"].warn).toHaveBeenCalledWith(
        "DELETE_FILE",
        `File at path "uploads/test.txt" not found during deletion`
      );
    });

    it("should throw InternalServerErrorException if deletion fails", () => {
      // Arrange
      filesRepo.findByPrivateKey.mockReturnValue(mockFile);
      (fs.existsSync as jest.Mock).mockReturnValue(true); // File exists
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {
        throw new Error("File deletion failed");
      });

      // Act & Assert
      expect(() => service.deleteFileByPrivateKey(privateKey)).toThrow(
        InternalServerErrorException
      );
    });

    it("should throw NotFoundException if file is not found", () => {
      // Arrange
      filesRepo.findByPrivateKey.mockReturnValue(undefined); // File not found

      // Act & Assert
      expect(() => service.deleteFileByPrivateKey(privateKey)).toThrow(
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
