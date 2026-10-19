# Bölümdeki kod ve istek örnekleri

Bu örnekleri bölümdeki sırayla, **kendi Movie API çalışma kopyanıza** uygulayın. Bazı parçalar var olan bir dosyanın içine eklenir; tek başlarına çalıştırılmaz.

### Örnek 1 — bash

```bash
npm install --save-dev supertest
```

### Örnek 2 — js

```js
export const app = express();
```

### Örnek 3 — js

```js
import { app } from "./server.js";
```

### Örnek 4 — js

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

import { app } from "../src/server.js";

describe("health endpoint", () => {
  it("200 döner", async () => {
    const response = await request(app)
      .get("/health");

    assert.equal(response.status, 200);
  });
});
```

### Örnek 5 — text

```text
status
body
headers
```

### Örnek 6 — js

```js
const response = await request(app)
  .post("/auth/register")
  .send({
    name: "Ada",
    email: "ada@example.com",
    password: "uzun-bir-test-parolasi",
  });

assert.equal(response.status, 201);
assert.equal(
  response.body.data.email,
  "ada@example.com",
);
```

### Örnek 7 — js

```js
assert.equal(
  response.body.data.passwordHash,
  undefined,
);
```

### Örnek 8 — js

```js
const cookies = response.headers["set-cookie"];

assert.ok(cookies);
```

### Örnek 9 — text

```text
HttpOnly
```

### Örnek 10 — js

```js
const agent = request.agent(app);
```

### Örnek 11 — js

```js
await agent
  .post("/auth/login")
  .send(credentials);

const meResponse = await agent
  .get("/users/me");
```

### Örnek 12 — text

```text
validation
router
controller
service
database
cookie
auth middleware
```
