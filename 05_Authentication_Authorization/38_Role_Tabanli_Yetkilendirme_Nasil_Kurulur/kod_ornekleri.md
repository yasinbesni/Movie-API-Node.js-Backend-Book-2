# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — text

```text
user  → normal kullanıcı
admin → yönetici
```

### Örnek 2 — js

```js
role: {
  type: String,
  enum: ["user", "admin"],
  default: "user",
},
```

### Örnek 3 — js

```js
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error("Kimlik doğrulaması gerekli.");
      error.status = 401;
      return next(error);
    }

    if (!allowedRoles.includes(req.user.role)) {
      const error = new Error("Bu işlem için yetkiniz yok.");
      error.status = 403;
      return next(error);
    }

    return next();
  };
};
```

### Örnek 4 — js

```js
import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { requireRole } from "../middlewares/requireRole.js";

const router = Router();

router.get(
  "/access-check",
  authenticate,
  requireRole("admin"),
  (req, res) => {
    res.status(200).json({ data: { message: "Yönetici erişimi doğrulandı." } });
  },
);

export default router;
```

### Örnek 5 — js

```js
import adminRouter from "./routers/admin.js";
```

### Örnek 6 — js

```js
app.use("/admin", adminRouter);
```

### Örnek 7 — text

```text
authenticate → req.user → requireRole("admin") → yanıt
```
