import { registerAs } from "@nestjs/config";

export const appConfig = registerAs("app", () => ({
  fileUploadPath: process.env.FILE_UPLOAD_PATH || "./uploads",
  maxUploadBytesPerIp: parseInt(
    process.env.MAX_UPLOAD_BYTES_PER_IP || "524288"
  ),
  maxDownloadBytesPerIp: parseInt(
    process.env.MAX_DOWNLOAD_BYTES_PER_IP || "524288"
  ),
}));
