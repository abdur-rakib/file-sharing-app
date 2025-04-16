import { diskStorage } from "multer";
import * as fs from "fs";
import * as path from "path";

export function fileUploadToDisk() {
  return {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath =
          process.env.FILE_UPLOAD_PATH || path.join(process.cwd(), "uploads");

        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      },
    }),
  };
}
