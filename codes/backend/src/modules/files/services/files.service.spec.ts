import { Test, TestingModule } from "@nestjs/testing";
import { FilesService } from "./files.service";
import { FilesRepository } from "../repositories/files.repository";
import { IpUsageRepository } from "../repositories/ip-usage.repository";

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: FilesRepository,
          useValue: {
            save: jest.fn(),
            findByPublicKey: jest.fn(),
            deleteByPrivateKey: jest.fn(),
          },
        },
        {
          provide: IpUsageRepository,
          useValue: {
            updateIpUsage: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    filesRepo = module.get(FilesRepository);
    ipUsageRepo = module.get(IpUsageRepository);
  });

  describe("uploadFile", () => {
    it("should save file and update IP usage", () => {
      // arrange
      const file = {
        filename: "test.txt",
        path: "uploads/test.txt",
        mimetype: "text/plain",
        size: 1234,
      } as Express.Multer.File;

      // act
      const result = service.uploadFile(file, "127.0.0.1");

      // assert
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
      // arrange
      const mockFile = {
        filename: "test.txt",
        mimetype: "text/plain",
        size: 1234,
        path: "uploads/test.txt",
        publicKey: "some-public-key",
        privateKey: "some-private-key",
        uploadedAt: "2025-04-10T00:00:00.000Z",
      };
      filesRepo.findByPublicKey.mockReturnValue(mockFile);

      // act
      const result = service.getFileByPublicKey("some-public-key");

      // assert
      expect(result).toBe(mockFile);
      expect(filesRepo.findByPublicKey).toHaveBeenCalledWith("some-public-key");
    });
  });

  describe("deleteFileByPrivateKey", () => {
    it("should delete file by private key", () => {
      // arrange
      const privateKey = "some-private-key";

      // act
      service.deleteFileByPrivateKey(privateKey);

      // assert
      expect(filesRepo.deleteByPrivateKey).toHaveBeenCalledWith(privateKey);
    });
  });

  describe("updateIpUsage", () => {
    it("should call updateIpUsage in repo with correct args", () => {
      // arrange
      const updateIpUsageArgs = {
        ip: "1.2.3.4",
        size: 1000,
        isUpload: true,
      };

      // act
      service.updateIpUsage(
        updateIpUsageArgs.ip,
        updateIpUsageArgs.size,
        updateIpUsageArgs.isUpload
      );

      // assert
      expect(ipUsageRepo.updateIpUsage).toHaveBeenCalledWith(
        updateIpUsageArgs.ip,
        updateIpUsageArgs.size,
        updateIpUsageArgs.isUpload,
        "2025-04-10"
      );
    });
  });
});
