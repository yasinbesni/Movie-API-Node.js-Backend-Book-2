# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — js

```js
import { env } from "../config/env.js";

export const isProduction = env.nodeEnv === "production";

export const sessionCookieName = isProduction
  ? "__Host-sid"
  : "sid";
```

### Örnek 2 — js

```js
import {
  isProduction,
  sessionCookieName,
} from "./utils/sessionCookie.js";
```

### Örnek 3 — js

```js
import {
  isProduction,
  sessionCookieName,
} from "../utils/sessionCookie.js";
```

### Örnek 4 — js

```js
export const logoutUser = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    res.clearCookie(sessionCookieName, {
      path: "/",
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
    });

    return res.status(204).send();
  });
};
```

### Örnek 5 — js

```js
router.post("/logout", logoutUser);
```

### Örnek 6 — js

```js
app.get("/debug/only-logged-in", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      message: "Önce giriş yapmalısınız.",
    });
  }

  return res.status(200).json({
    message: "Oturum geçerli.",
  });
});
```
