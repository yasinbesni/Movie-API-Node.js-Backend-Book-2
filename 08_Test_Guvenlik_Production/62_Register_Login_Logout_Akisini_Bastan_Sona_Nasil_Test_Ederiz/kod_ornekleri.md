# Bölümdeki kod ve istek örnekleri

Bu örnekleri bölümdeki sırayla, **kendi Movie API çalışma kopyanıza** uygulayın. Bazı parçalar var olan bir dosyanın içine eklenir; tek başlarına çalıştırılmaz.

### Örnek 1 — text

```text
register
↓
login
↓
protected request
↓
refresh
↓
logout
```

### Örnek 2 — text

```text
refresh cookie'deki raw token'ı al
↓
hash ile DB kaydını bul
↓
aktif token'ı revoke et
↓
access + refresh cookie'leri temizle
```

### Örnek 3 — js

```js
export const logout = async (rawRefreshToken) => {
  if (!rawRefreshToken) {
    return;
  }

  const tokenHash = hashToken(rawRefreshToken);

  await RefreshToken.findOneAndUpdate(
    {
      tokenHash,
      revokedAt: null,
    },
    {
      $set: { revokedAt: new Date() },
    },
  );
};
```

### Örnek 4 — js

```js
import {
  describe,
  it,
  beforeEach,
} from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

import { app } from "../src/server.js";
import { User } from "../src/db/models/user.js";
import { RefreshToken } from "../src/db/models/refreshToken.js";
```

### Örnek 5 — js

```js
beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    RefreshToken.deleteMany({}),
  ]);
});
```

### Örnek 6 — js

```js
it("register-login-me-logout akışı çalışır", async () => {
  const agent = request.agent(app);

  const registerResponse = await agent
    .post("/auth/register")
    .send({
      name: "Ada",
      email: "ada@example.com",
      password: "uzun-bir-test-parolasi",
    });

  assert.equal(registerResponse.status, 201);

  const loginResponse = await agent
    .post("/auth/login")
    .send({
      email: "ada@example.com",
      password: "uzun-bir-test-parolasi",
    });

  assert.equal(loginResponse.status, 200);

  const meResponse = await agent
    .get("/users/me");

  assert.equal(meResponse.status, 200);
  assert.equal(
    meResponse.body.data.email,
    "ada@example.com",
  );

  const logoutResponse = await agent
    .post("/auth/logout");

  assert.equal(logoutResponse.status, 204);
});
```

### Örnek 7 — js

```js
const refreshResponse = await agent
  .post("/auth/refresh");

assert.equal(refreshResponse.status, 401);
```

### Örnek 8 — js

```js
const response = await request(app)
  .post("/auth/login")
  .send({
    email: "ada@example.com",
    password: "yanlis-parola",
  });

assert.equal(response.status, 401);
assert.equal(
  response.body.message,
  "E-posta veya parola hatalı.",
);
```

### Örnek 9 — text

```text
R1 ile refresh → başarılı, R2 geldi
R1'i tekrar kullan → 401 + family revoke
```
