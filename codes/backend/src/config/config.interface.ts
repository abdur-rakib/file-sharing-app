export interface IAppConfig {
  fileUploadPath: string;
  maxUploadBytesPerIp: number;
  maxDownloadBytesPerIp: number;
  fileUplaodServiceProvider?: "local" | "google";
}
