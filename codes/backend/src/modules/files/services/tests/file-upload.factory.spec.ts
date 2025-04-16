import { FileUploadFactory } from "../file-upload.factory";
import { LocalFileManageService } from "../local-file-manage.service";
import { CloudFileManageService } from "../cloud-file-manage.service";

describe("FileUploadFactory", () => {
  let factory: FileUploadFactory;
  let localService: LocalFileManageService;
  let googleService: CloudFileManageService;

  beforeEach(() => {
    localService = {} as LocalFileManageService;
    googleService = {} as CloudFileManageService;
    factory = new FileUploadFactory(localService, googleService);
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
