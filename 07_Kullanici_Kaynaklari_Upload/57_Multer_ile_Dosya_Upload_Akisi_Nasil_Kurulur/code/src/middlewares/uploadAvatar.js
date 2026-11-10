import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error("Desteklenmeyen dosya türü.");
    error.status = 415;
    return callback(error);
  }

  callback(null, true);
};

const acceptAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },
}).single("avatar");

export const uploadAvatar = (req, res, next) => {
  acceptAvatar(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      error.status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    }
    return next(error);
  });
};
