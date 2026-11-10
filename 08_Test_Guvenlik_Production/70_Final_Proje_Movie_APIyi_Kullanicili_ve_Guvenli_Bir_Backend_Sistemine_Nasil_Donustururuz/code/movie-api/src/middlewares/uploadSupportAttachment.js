import multer from "multer";

const allowed = new Set([
  "image/jpeg", "image/png", "image/webp", "application/pdf",
]);

const accept = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // En fazla 2 MB
    files: 1, fields: 1, parts: 2,
    fieldSize: 8 * 1024,
  },
  fileFilter(req, file, callback) {
    // Bu erken kontrol yalnızca istemcinin bildirdiği türü inceler.
    if (!allowed.has(file.mimetype)) {
      const error = new Error("Yalnızca JPG, PNG, WebP veya PDF kabul edilir.");
      error.status = 415;
      return callback(error);
    }
    callback(null, true);
  },
}).single("attachment");

export const uploadSupportAttachment = (req, res, next) => {
  accept(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      error.status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    }
    next(error);
  });
};
