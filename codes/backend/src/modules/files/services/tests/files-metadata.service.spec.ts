import { v4 as uuidv4 } from "uuid";
import { getToday } from "../../../../common/utils/date.utils";
import { FileMetadataService } from "../files-metadata.service";
import { FilesRepository } from "../../repositories/files.repository";
import { IpUsageRepository } from "../../repositories/ip-usage.repository";

jest.mock("uuid", () => ({
  v4: jest.fn(),
}));

jest.mock("../../../../common/utils/date.utils.ts", () => ({
  getToday: jest.fn(),
}));

describe("FileMetadataService", () => {
  let service: FileMetadataService;
  let filesRepo: jest.Mocked<FilesRepository>;
  let ipUsageRepo: jest.Mocked<IpUsageRepository>;

  beforeEach(() => {
    filesRepo = {
      save: jest.fn(),
    } as unknown as jest.Mocked<FilesRepository>;

    ipUsageRepo = {
      updateIpUsage: jest.fn(),
    } as unknown as jest.Mocked<IpUsageRepository>;

    service = new FileMetadataService(filesRepo, ipUsageRepo);
  });

  it("should save file metadata and update IP usage", () => {
    // Mock input
    const file = {
      filename: "testfile.txt",
      path: "/uploads/testfile.txt",
      mimetype: "text/plain",
      size: 1024,
    } as Express.Multer.File;

    const ip = "192.168.1.1";

    // Mock UUIDs and date
    const mockPublicKey = "public-key-123";
    const mockPrivateKey = "private-key-456";
    const mockToday = "2024-04-17";

    (uuidv4 as jest.Mock)
      .mockReturnValueOnce(mockPublicKey)
      .mockReturnValueOnce(mockPrivateKey);

    (getToday as jest.Mock).mockReturnValue(mockToday);

    // Run
    const result = service.saveFileMetadata(file, ip);

    // Validate
    expect(result).toEqual({
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      publicKey: mockPublicKey,
      privateKey: mockPrivateKey,
      uploadedAt: expect.any(String),
      lastAccessedAt: expect.any(String),
    });

    expect(filesRepo.save).toHaveBeenCalledWith({
      ...result,
    });

    expect(ipUsageRepo.updateIpUsage).toHaveBeenCalledWith(
      ip,
      file.size,
      true,
      mockToday
    );
  });
});
