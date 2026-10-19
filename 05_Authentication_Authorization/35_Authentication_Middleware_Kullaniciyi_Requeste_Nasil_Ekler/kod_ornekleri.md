# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — text

```text
İstek (Request)
    ↓
Erişim çerezi var mı?
    ↓
JWT imzası ve süresi geçerli mi?
    ↓
Veritabanında kullanıcı bulunuyor mu?
    ↓
req.user = kullanıcı
    ↓
Controller
```

### Örnek 2 — js

```js
import { User } from "../db/models/user.js";
import { verifyAccessToken } from "../utils/token.js";

const unauthorized = () => {
  const error = new Error("Kimlik doğrulaması gerekli.");
  error.status = 401;
  return error;
};

export const authenticate = async (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) return next(unauthorized());

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return next(unauthorized());
  }

  try {
    const user = await User.findById(payload.sub);
    if (!user) return next(unauthorized());

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};
```

### Örnek 3 — js

```js
import { toPublicUser } from "../utils/toPublicUser.js";

export const getCurrentUser = (req, res) => {
  res.status(200).json({ data: toPublicUser(req.user) });
};
```

### Örnek 4 — js

```js
import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { getCurrentUser } from "../controllers/users.js";

const router = Router();
router.get("/me", authenticate, getCurrentUser);

export default router;
```

### Örnek 5 — js

```js
import usersRouter from "./routers/users.js";
```

### Örnek 6 — js

```js
app.use("/users", usersRouter);
```
