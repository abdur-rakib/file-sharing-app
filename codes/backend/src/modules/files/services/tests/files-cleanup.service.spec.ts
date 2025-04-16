import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { FileCleanupService } from "../file-cleanup.service";
import { FilesRepository } from "../../repositories/files.repository";
import { FilesService } from "../files.service";
import { CustomLogger } from "../../../../shared/services/custom-logger.service";

describe("FileCleanupService", () => {
  let service: FileCleanupService;
  let filesRepo: jest.Mocked<FilesRepository>;
  let filesService: jest.Mocked<FilesService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileCleanupService,
        {
          provide: FilesRepository,
          useValue: {
            findInactiveFiles: jest.fn(),
          },
        },
        {
          provide: FilesService,
          useValue: {
            deleteFileByPrivateKey: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: CustomLogger,
          useValue: {
            setContext: jest.fn(),
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FileCleanupService>(FileCleanupService);
    filesRepo = module.get(FilesRepository);
    filesService = module.get(FilesService);
    configService = module.get(ConfigService);
  });

  it("should not run cleanup when disabled", async () => {
    configService.get.mockReturnValue({ enabled: false });
    await service.cleanupInactiveFiles();
    expect(filesRepo.findInactiveFiles).not.toHaveBeenCalled();
  });

  it("should cleanup inactive files", async () => {
    const mockFiles = [
      {
        filename: "test.txt",
        mimetype: "text/plain",
        size: 1234,
        path: "uploads/test.txt",
        publicKey: "some-public-key",
        privateKey: "some-private-key",
        uploadedAt: "2025-04-10T00:00:00.000Z",
        lastAccessedAt: "2025-04-10T00:00:00.000Z",
      },
    ];

    configService.get.mockReturnValue({
      fileCleanupEnabled: true,
      fileCleanupInactivityDays: 7,
    });
    filesRepo.findInactiveFiles.mockResolvedValue(mockFiles);

    await service.cleanupInactiveFiles();

    expect(filesRepo.findInactiveFiles).toHaveBeenCalledWith(7);
    expect(filesService.deleteFileByPrivateKey).toHaveBeenCalledTimes(1);
  });
});
