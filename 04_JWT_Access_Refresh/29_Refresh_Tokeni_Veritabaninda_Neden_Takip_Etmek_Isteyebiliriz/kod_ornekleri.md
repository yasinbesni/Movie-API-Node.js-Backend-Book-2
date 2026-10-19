# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — js

```js
import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export const RefreshToken = mongoose.model(
  "RefreshToken",
  refreshTokenSchema,
);
```

### Örnek 2 — js

```js
import { RefreshToken } from "../db/models/refreshToken.js";
import {
  createRefreshToken,
  hashToken,
} from "../utils/token.js";

export const issueRefreshToken = async (userId) => {
  const rawToken = createRefreshToken();

  await RefreshToken.create({
    userId,
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ),
  });

  return rawToken;
};
```

### Örnek 3 — text

```text
tokenHash eşleşiyor mu?
revokedAt boş mu?
expiresAt henüz geçmedi mi?
User hesabı hâlâ kullanılabilir mi?
```
