# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — js

```js
import { AccountToken } from "../db/models/accountToken.js";
import {
  createOpaqueToken,
  hashToken,
} from "../utils/token.js";

const EMAIL_TOKEN_LIFETIME_MS = 30 * 60 * 1000;

export const issueEmailVerificationToken = async (userId) => {
  await AccountToken.updateMany(
    { userId, type: "email_verify", usedAt: null },
    { $set: { usedAt: new Date() } },
  );

  const rawToken = createOpaqueToken();
  await AccountToken.create({
    userId,
    type: "email_verify",
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + EMAIL_TOKEN_LIFETIME_MS),
  });

  return rawToken;
};
```

### Örnek 2 — http

```http
POST /auth/verify-email
Content-Type: application/json
```

### Örnek 3 — json

```json
{ "token": "epostadan-gelen-ham-deger" }
```

### Örnek 4 — js

```js
export const verifyEmailSchema = Joi.object({
  token: Joi.string().trim().required(),
});
```

### Örnek 5 — js

```js
import { User } from "../db/models/user.js";

export const verifyEmailToken = async (rawToken) => {
  const token = await AccountToken.findOneAndUpdate(
    {
      tokenHash: hashToken(rawToken),
      type: "email_verify",
      usedAt: null,
      expiresAt: { $gt: new Date() },
    },
    { $set: { usedAt: new Date() } },
    { new: false },
  );

  if (!token) {
    const error = new Error("Doğrulama bağlantısı geçersiz veya süresi dolmuş.");
    error.status = 400;
    throw error;
  }

  await User.findByIdAndUpdate(token.userId, {
    $set: { isEmailVerified: true },
  });
};
```

### Örnek 6 — js

```js
import { verifyEmailToken } from "../services/accountTokens.js";

export const verifyEmailController = async (req, res) => {
  await verifyEmailToken(req.body.token);
  res.status(200).json({ message: "E-posta adresi doğrulandı." });
};
```

### Örnek 7 — js

```js
router.post(
  "/verify-email",
  validateBody(verifyEmailSchema),
  verifyEmailController,
);
```
