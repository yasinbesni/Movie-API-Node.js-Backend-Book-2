# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — text

```text
R1 ──yenile──► R2 ──yenile──► R3
   R1 biter      R2 biter
```

### Örnek 2 — js

```js
familyId: {
  type: String,
  required: true,
  index: true,
},
usedAt: {
  type: Date,
  default: null,
},
```

### Örnek 3 — js

```js
import { randomUUID } from "node:crypto";

export const issueRefreshToken = async (
  userId,
  familyId = randomUUID(),
) => {
  const rawToken = createRefreshToken();

  await RefreshToken.create({
    userId,
    familyId,
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return rawToken;
};
```

### Örnek 4 — js

```js
export const rotateRefreshToken = async (rawToken) => {
  const tokenHash = hashToken(rawToken);
  const previous = await RefreshToken.findOneAndUpdate(
    {
      tokenHash,
      usedAt: null,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    },
    { $set: { usedAt: new Date() } },
    { new: false },
  );

  if (!previous) {
    throwUnauthorized();
  }

  const user = await User.findById(previous.userId);
  if (!user) {
    throwUnauthorized();
  }

  const refreshToken = await issueRefreshToken(
    user._id,
    previous.familyId,
  );

  return {
    accessToken: createAccessToken(user._id.toString()),
    refreshToken,
    user,
  };
};
```

### Örnek 5 — js

```js
import { setAuthCookies } from "../utils/authCookies.js";

export const refreshSession = async (req, res) => {
  const rawToken = req.cookies?.refreshToken;
  if (!rawToken) {
    const error = new Error("Oturum yenilenemedi.");
    error.status = 401;
    throw error;
  }

  const { accessToken, refreshToken, user } =
    await authService.rotateRefreshToken(rawToken);

  setAuthCookies(res, accessToken, refreshToken);
  res.status(200).json({ data: toPublicUser(user) });
};
```
