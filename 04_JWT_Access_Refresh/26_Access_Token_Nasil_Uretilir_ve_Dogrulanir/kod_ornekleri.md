# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — bash

```bash
npm install jsonwebtoken
```

### Örnek 2 — bash

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

### Örnek 3 — dotenv

```dotenv
JWT_ACCESS_SECRET=buraya-uretilen-rastgele-deger
```

### Örnek 4 — js

```js
jwtAccessSecret: getRequiredString("JWT_ACCESS_SECRET"),
```

### Örnek 5 — js

```js
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const createAccessToken = (userId) =>
  jwt.sign(
    { sub: userId },
    env.jwtAccessSecret,
    {
      algorithm: "HS256",
      expiresIn: "15m",
    },
  );

export const verifyAccessToken = (token) => {
  const payload = jwt.verify(
    token,
    env.jwtAccessSecret,
    { algorithms: ["HS256"] },
  );

  if (
    !payload ||
    typeof payload !== "object" ||
    typeof payload.sub !== "string" ||
    !payload.sub
  ) {
    throw new Error("Geçersiz erişim belirteci.");
  }

  return payload;
};
```

### Örnek 6 — js

```js
import {
  createAccessToken,
  verifyAccessToken,
} from "./src/utils/token.js";

const token = createAccessToken("ornek-user-id");
const payload = verifyAccessToken(token);

console.log(payload.sub); // ornek-user-id
```
