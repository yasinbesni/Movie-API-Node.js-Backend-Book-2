# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — text

```text
Access token: Film API'sine kısa süreli erişim
Refresh token: Yeni access token isteme
```

### Örnek 2 — js

```js
import { randomBytes, createHash } from "node:crypto";

export const createRefreshToken = () =>
  randomBytes(48).toString("base64url");

export const hashToken = (token) =>
  createHash("sha256")
    .update(token)
    .digest("hex");
```

### Örnek 3 — text

```text
Ada'nın tarayıcısı: ham yenileme belirteci
                     ↓
Sunucu: SHA-256 ile özetle
                     ↓
MongoDB: yalnız tokenHash
```
