# Bölümdeki kod ve istek örnekleri

Bu örnekleri bölümdeki sırayla, **kendi Movie API çalışma kopyanıza** uygulayın. Bazı parçalar var olan bir dosyanın içine eklenir; tek başlarına çalıştırılmaz.

### Örnek 1 — bash

```bash
npm install multer
```

### Örnek 2 — http

```http
POST /users/me/avatar
```

### Örnek 3 — text

```text
avatar
```

### Örnek 4 — text

```text
src/middlewares/uploadAvatar.js
```

### Örnek 5 — js

```js
import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    return callback(
      new Error("Desteklenmeyen dosya türü."),
    );
  }

  callback(null, true);
};

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },
}).single("avatar");
```

### Örnek 6 — text

```text
multipart Request
↓
Multer memory buffer
↓
upload service
↓
object storage / image service
```

### Örnek 7 — js

```js
router.post(
  "/me/avatar",
  authenticate,
  uploadAvatar,
  updateAvatar,
);
```

### Örnek 8 — js

```js
export const updateAvatar = async (req, res) => {
  if (!req.file) {
    const error = new Error("Avatar dosyası gerekli.");
    error.status = 400;
    throw error;
  }

  const avatarUrl = await filesService.saveAvatar({
    userId: req.user._id,
    buffer: req.file.buffer,
    mimeType: req.file.mimetype,
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { avatarUrl } },
    { new: true },
  );

  res.status(200).json({
    data: toPublicUser(user),
  });
};
```

### Örnek 9 — text

```text
magic-byte / signature doğrulama
image decoder ile gerçekten açılabiliyor mu?
yeniden encode
boyut ve pixel dimension limitleri
metadata temizleme
malware tarama gereksinimi
```

### Örnek 10 — text

```text
../../avatar.png
```

### Örnek 11 — text

```text
avatars/<userId>/<random-id>.webp
```

### Örnek 12 — text

```text
LIMIT_FILE_SIZE
→ 413 Payload Too Large
```

### Örnek 13 — text

```text
400 Bad Request
```
