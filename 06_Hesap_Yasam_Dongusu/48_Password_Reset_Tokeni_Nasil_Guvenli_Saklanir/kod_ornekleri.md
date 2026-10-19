# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — js

```js
const RESET_TOKEN_LIFETIME_MS = 20 * 60 * 1000;

export const issuePasswordResetToken = async (userId) => {
  await AccountToken.updateMany(
    { userId, type: "password_reset", usedAt: null },
    { $set: { usedAt: new Date() } },
  );

  const rawToken = createOpaqueToken();
  await AccountToken.create({
    userId,
    type: "password_reset",
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + RESET_TOKEN_LIFETIME_MS),
  });

  return rawToken;
};
```

### Örnek 2 — http

```http
POST /auth/reset-password
Content-Type: application/json
```

### Örnek 3 — json

```json
{
  "token": "epostadaki-ham-deger",
  "password": "yeni-uzun-bir-parola"
}
```

### Örnek 4 — js

```js
export const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().required(),
  password: Joi.string().min(15).max(128).required(),
});
```

### Örnek 5 — js

```js
const filter = {
  tokenHash: hashToken(rawToken),
  type: "password_reset",
  usedAt: null,
  expiresAt: { $gt: new Date() },
};
```
