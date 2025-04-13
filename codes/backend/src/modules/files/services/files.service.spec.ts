import { Test, TestingModule } from "@nestjs/testing";
import { FilesService } from "./files.service";
import { FilesRepository } from "../repositories/files.repository";
import { IpUsageRepository } from "../repositories/ip-usage.repository";
import { CustomLogger } from "../../../shared/services/custom-logger.service";
import { NotFoundException } from "@nestjs/common";

// Mocking the uuid module to return a fixed UUID
jest.mock("uuid", () => ({
  v4: jest.fn().mockReturnValue("mock-uuid"),
}));

// Mocking the date utility to return a fixed date
jest.mock("../../../common/utils/date.utils", () => ({
  getToday: jest.fn(() => "2025-04-10"),
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
    it("should delete file by private key", () => {
      filesRepo.findByPrivateKey.mockReturnValue(mockFile);

      service.deleteFileByPrivateKey(privateKey);

      expect(filesRepo.deleteByPrivateKey).toHaveBeenCalledWith(privateKey);
    });

    it("should throw NotFoundException if file is not found", () => {
      filesRepo.findByPrivateKey.mockReturnValue(undefined);

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
