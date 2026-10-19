# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — js

```js
authVersion: {
  type: Number,
  default: 0,
},
```

### Örnek 2 — js

```js
export const createAccessToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), ver: user.authVersion ?? 0 },
    env.jwtAccessSecret,
    { algorithm: "HS256", expiresIn: "15m" },
  );
```

### Örnek 3 — js

```js
if (payload.ver !== (user.authVersion ?? 0)) {
  return next(unauthorized());
}
```

### Örnek 4 — js

```js
import mongoose from "mongoose";
import { AccountToken } from "../db/models/accountToken.js";
import { RefreshToken } from "../db/models/refreshToken.js";
import { hashToken } from "../utils/token.js";
import { hashPassword } from "../utils/password.js";

export const resetPassword = async (rawToken, password) => {
  // Hash işlemini transaction başlamadan tamamlıyoruz.
  const passwordHash = await hashPassword(password);

  await mongoose.connection.transaction(async (session) => {
    const token = await AccountToken.findOneAndUpdate(
      {
        tokenHash: hashToken(rawToken),
        type: "password_reset",
        usedAt: null,
        expiresAt: { $gt: new Date() },
      },
      { $set: { usedAt: new Date() } },
      { new: false, session },
    );

    if (!token) {
      const error = new Error("Bağlantı geçersiz veya süresi dolmuş.");
      error.status = 400;
      throw error;
    }

    const user = await User.findByIdAndUpdate(
      token.userId,
      {
        $set: { passwordHash },
        $inc: { authVersion: 1 },
      },
      { new: true, session },
    );
    if (!user) throw new Error("Kullanıcı kaydı bulunamadı.");

    await RefreshToken.updateMany(
      { userId: token.userId, revokedAt: null },
      { $set: { revokedAt: new Date() } },
      { session },
    );
  });
};
```

### Örnek 5 — js

```js
export const resetPasswordController = async (req, res) => {
  await resetPassword(req.body.token, req.body.password);
  res.status(200).json({ message: "Parola güncellendi. Yeniden giriş yapın." });
};
```
