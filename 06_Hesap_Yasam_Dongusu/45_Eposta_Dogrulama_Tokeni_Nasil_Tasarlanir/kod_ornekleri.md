# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — text

```text
https://app.example.com/verify-email?userId=ada-id
```

### Örnek 2 — js

```js
import mongoose from "mongoose";

const accountTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["email_verify", "password_reset"],
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
    usedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export const AccountToken =
  mongoose.models.AccountToken ||
  mongoose.model("AccountToken", accountTokenSchema);
```

### Örnek 3 — js

```js
export const createOpaqueToken = () =>
  randomBytes(32).toString("base64url");
```

### Örnek 4 — js

```js
const rawToken = createOpaqueToken();
const tokenHash = hashToken(rawToken);
```

### Örnek 5 — js

```js
const filter = {
  tokenHash,
  type: "email_verify",
  usedAt: null,
  expiresAt: { $gt: new Date() },
};
```
