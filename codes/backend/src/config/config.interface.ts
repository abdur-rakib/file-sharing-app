export interface IAppConfig {
  fileUploadPath: string;
  maxUploadBytesPerIp: number;
  maxDownloadBytesPerIp: number;
  fileUplaodServiceProvider?: "local" | "google";
  fileCleanupEnabled: boolean;
  fileCleanupInactivityDays: number;
  fileCleanupInterval: string; // Cron expression
}

export interface IDBConfig {
  dbRelativePath: string;
}
