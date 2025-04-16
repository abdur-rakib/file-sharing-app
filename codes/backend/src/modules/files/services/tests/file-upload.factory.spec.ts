import { FileUploadFactory } from "../file-upload.factory";
import { LocalFileUploadService } from "../local-file-upload.service";
import { GoogleFileUploadService } from "../google-file-upload.service";

describe("FileUploadFactory", () => {
  let factory: FileUploadFactory;
  let localService: LocalFileUploadService;
  let googleService: GoogleFileUploadService;

  beforeEach(() => {
    localService = {} as LocalFileUploadService;
    googleService = {} as GoogleFileUploadService;
    factory = new FileUploadFactory(localService, googleService);
  });

  it('should return LocalFileUploadService when provider is "local"', () => {
    const result = factory.getService("local");
    expect(result).toBe(localService);
  });

  it('should return GoogleFileUploadService when provider is "google"', () => {
    const result = factory.getService("google");
    expect(result).toBe(googleService);
  });

  it("should return LocalFileUploadService when provider is unknown", () => {
    const result = factory.getService("something-wrong" as any);
    expect(result).toBe(localService);
  });
});
