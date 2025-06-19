import { FileManageFactory } from "../file-storage.factory";
import { LocalFileManageService } from "../local-file-storage.service";
import { CloudFileManageService } from "../google-storage.service";

describe("FileManageFactory", () => {
  let factory: FileManageFactory;
  let localService: LocalFileManageService;
  let googleService: CloudFileManageService;

  beforeEach(() => {
    localService = {} as LocalFileManageService;
    googleService = {} as CloudFileManageService;
    factory = new FileManageFactory(localService, googleService);
  });

  it('should return LocalFileManageService when provider is "local"', () => {
    const result = factory.getService("local");
    expect(result).toBe(localService);
  });

  it('should return CloudFileManageService when provider is "google"', () => {
    const result = factory.getService("google");
    expect(result).toBe(googleService);
  });

  it("should return LocalFileManageService when provider is unknown", () => {
    const result = factory.getService("something-wrong" as any);
    expect(result).toBe(localService);
  });
});
