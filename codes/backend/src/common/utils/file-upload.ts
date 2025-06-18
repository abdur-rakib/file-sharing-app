import { diskStorage } from "multer";
import { promises as fsPromises } from "fs";
import * as path from "path";

export function fileUploadToDisk() {
  return {
    storage: diskStorage({
      destination: async (req, file, cb) => {
        try {
          // Use environment variable or default path
          const uploadPath =
            process.env.FOLDER || path.join(process.cwd(), "uploads");

          // Normalize path to prevent directory traversal
          const normalizedPath = path.normalize(uploadPath);

          // Create directory if it doesn't exist (async)
          // Using try-catch instead of existsSync to avoid race conditions
          try {
            await fsPromises.mkdir(normalizedPath, { recursive: true });
          } catch (err) {
            // EEXIST error is expected and can be ignored
            if (err.code !== "EEXIST") {
              return cb(err, null);
            }
          }

          // Return the normalized path
          cb(null, normalizedPath);
        } catch (err) {
          // Pass any errors to multer
          cb(err, null);
        }
      },
      filename: (req, file, cb) => {
        try {
          // Create a unique filename to prevent collisions
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const uniqueSuffix = `${timestamp}-${randomString}`;

          // Extract extension safely
          const ext = path.extname(file.originalname).toLowerCase();

          // Combine for final filename
          const safeFilename = `${uniqueSuffix}${ext}`;

          cb(null, safeFilename);
        } catch (err) {
          cb(err, null);
        }
      },
    }),
    // Add file size limits to prevent abuse
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760"), // 10MB default
    },
  };
}
