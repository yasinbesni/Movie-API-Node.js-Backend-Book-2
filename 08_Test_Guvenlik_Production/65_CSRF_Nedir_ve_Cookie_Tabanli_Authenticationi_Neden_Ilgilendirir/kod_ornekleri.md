# Bölümdeki kod ve istek örnekleri

Bu örnekleri bölümdeki sırayla, **kendi Movie API çalışma kopyanıza** uygulayın. Bazı parçalar var olan bir dosyanın içine eklenir; tek başlarına çalıştırılmaz.

### Örnek 1 — text

```text
kullanıcının browser'ına
hedef siteye Request göndertmek
```

### Örnek 2 — js

```js
sameSite: "lax"
```

### Örnek 3 — text

```text
Strict
```

### Örnek 4 — text

```text
random csrf token üret
+
server'ın doğruladığı sessionBinding
↓
HMAC hesapla
↓
imzalı değeri cookie'ye koy
↓
raw csrf token'ı frontend'e ver
```

### Örnek 5 — http

```http
X-CSRF-Token: raw-token
```

### Örnek 6 — js

```js
import {
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const signCsrf = (token, sessionBinding) => {
  return createHmac("sha256", env.csrfSecret)
    .update(`${sessionBinding}.${token}`)
    .digest("hex");
};

export const createCsrfPair = (sessionBinding) => {
  const token = randomBytes(32).toString("base64url");
  const signature = signCsrf(token, sessionBinding);

  return { token, signature };
};

export const verifyCsrfPair = (
  token,
  signature,
  sessionBinding,
) => {
  const expected = Buffer.from(
    signCsrf(token, sessionBinding),
    "hex",
  );
  const received = Buffer.from(signature, "hex");

  return (
    received.length === expected.length &&
    timingSafeEqual(received, expected)
  );
};
```

### Örnek 7 — http

```http
X-CSRF-Token
```

### Örnek 8 — text

```text
Origin
```

### Örnek 9 — text

```text
SameSite
+
CSRF token
+
sıkı CORS
+
Origin/Fetch Metadata değerlendirmesi
```

### Örnek 10 — text

```text
POST
PUT
PATCH
DELETE
```
