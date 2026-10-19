# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — http

```http
POST /auth/refresh
```

### Örnek 2 — js

```js
const throwUnauthorized = () => {
  const error = new Error("Oturum yenilenemedi.");
  error.status = 401;
  throw error;
};

export const refreshAccessToken = async (rawToken) => {
  const tokenHash = hashToken(rawToken);

  const storedToken = await RefreshToken.findOne({ tokenHash });
  if (
    !storedToken ||
    storedToken.revokedAt ||
    storedToken.expiresAt <= new Date()
  ) {
    throwUnauthorized();
  }

  const user = await User.findById(storedToken.userId);
  if (!user) {
    throwUnauthorized();
  }

  return {
    accessToken: createAccessToken(user._id.toString()),
    user,
  };
};
```

### Örnek 3 — js

```js
import { accessCookieOptions } from "../utils/authCookies.js";

export const refreshSession = async (req, res) => {
  const rawToken = req.cookies?.refreshToken;
  if (!rawToken) {
    const error = new Error("Oturum yenilenemedi.");
    error.status = 401;
    throw error;
  }

  const { accessToken, user } =
    await authService.refreshAccessToken(rawToken);

  res.cookie("accessToken", accessToken, accessCookieOptions);
  res.status(200).json({ data: toPublicUser(user) });
};
```

### Örnek 4 — js

```js
router.post("/refresh", refreshSession);
```
