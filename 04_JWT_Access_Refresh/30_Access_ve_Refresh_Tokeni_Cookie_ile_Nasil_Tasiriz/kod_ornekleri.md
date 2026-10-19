# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — js

```js
import { env } from "../config/env.js";

const isProduction = env.nodeEnv === "production";

const baseOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
};

export const accessCookieOptions = {
  ...baseOptions,
  path: "/",
  maxAge: 15 * 60 * 1000,
};

export const refreshCookieOptions = {
  ...baseOptions,
  path: "/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const setAuthCookies = (
  res,
  accessToken,
  refreshToken,
) => {
  res.cookie("accessToken", accessToken, accessCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);
};

export const clearAuthCookies = (res) => {
  const { maxAge: _a, ...accessClear } = accessCookieOptions;
  const { maxAge: _r, ...refreshClear } = refreshCookieOptions;

  res.clearCookie("accessToken", accessClear);
  res.clearCookie("refreshToken", refreshClear);
};
```

### Örnek 2 — js

```js
import { createAccessToken } from "../utils/token.js";
import { setAuthCookies } from "../utils/authCookies.js";

export const loginUserWithToken = async (req, res) => {
  const user = await authService.loginUser(req.body);

  const accessToken = createAccessToken(
    user._id.toString(),
  );
  const refreshToken = await authService.issueRefreshToken(
    user._id,
  );

  setAuthCookies(res, accessToken, refreshToken);

  res.status(200).json({
    message: "Giriş başarılı.",
    data: toPublicUser(user),
  });
};
```

### Örnek 3 — js

```js
router.post(
  "/jwt/login",
  validateBody(loginUserSchema),
  loginUserWithToken,
);
```

### Örnek 4 — bash

```bash
npm install cookie-parser
```

### Örnek 5 — js

```js
import cookieParser from "cookie-parser";

app.use(cookieParser());
```

### Örnek 6 — text

```text
accessToken  → Path=/      → yaklaşık 15 dakika
refreshToken → Path=/auth  → yaklaşık 7 gün
```
