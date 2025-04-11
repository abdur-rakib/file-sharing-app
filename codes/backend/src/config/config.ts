import { registerAs } from "@nestjs/config";

export const appConfig = registerAs("app", () => ({
  fileUploadPath: process.env.FILE_UPLOAD_PATH || "./uploads",
}));
