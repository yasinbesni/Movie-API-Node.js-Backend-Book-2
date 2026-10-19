# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — js

```js
isEmailVerified: {
  type: Boolean,
  default: false,
},
```

### Örnek 2 — text

```text
Ada kaydolabilir ve giriş yapabilir.
Profilini görebilir.
Bazı içerik oluşturma işlemleri için e-posta doğrulaması istenebilir.
```

### Örnek 3 — js

```js
export const requireVerifiedEmail = (req, res, next) => {
  if (req.user?.isEmailVerified !== true) {
    const error = new Error(
      "Bu işlem için e-posta doğrulaması gerekli.",
    );
    error.status = 403;
    return next(error);
  }

  return next();
};
```

### Örnek 4 — js

```js
import { requireVerifiedEmail } from "../middlewares/requireVerifiedEmail.js";
```

### Örnek 5 — js

```js
router.get(
  "/me/verification-check",
  authenticate,
  requireVerifiedEmail,
  (req, res) => res.status(200).json({ message: "E-posta doğrulandı." }),
);
```
