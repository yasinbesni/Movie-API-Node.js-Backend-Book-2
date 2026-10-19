# Bölümdeki kod ve istek örnekleri

Bu örnekleri bölümdeki sırayla, **kendi Movie API çalışma kopyanıza** uygulayın. Bazı parçalar var olan bir dosyanın içine eklenir; tek başlarına çalıştırılmaz.

### Örnek 1 — text

```text
test/password.test.js
```

### Örnek 2 — js

```js
import test from "node:test";
import assert from "node:assert/strict";

import {
  hashPassword,
  verifyPassword,
} from "../src/utils/password.js";

test("hashlenen parola doğrulanabilir", async () => {
  const password = "uzun-bir-test-parolasi";

  const hash = await hashPassword(password);

  const result = await verifyPassword(
    hash,
    password,
  );

  assert.equal(result, true);
});
```

### Örnek 3 — js

```js
test("yanlış parola doğrulanmaz", async () => {
  const hash = await hashPassword(
    "dogru-parola-123",
  );

  const result = await verifyPassword(
    hash,
    "yanlis-parola-123",
  );

  assert.equal(result, false);
});
```

### Örnek 4 — json

```json
{
  "scripts": {
    "test": "node --test"
  }
}
```

### Örnek 5 — bash

```bash
npm test
```

### Örnek 6 — text

```text
*.test.js
```

### Örnek 7 — js

```js
assert.equal(result, true);
```

### Örnek 8 — js

```js
assert.equal(actual, expected);
assert.deepEqual(actualObject, expectedObject);
assert.ok(value);
assert.rejects(asyncFn);
```

### Örnek 9 — js

```js
import { describe, it } from "node:test";

import assert from "node:assert/strict";

describe("password utils", () => {
  it("doğru parolayı kabul eder", async () => {
    // ...
  });
});
```

### Örnek 10 — js

```js
before()
after()
beforeEach()
afterEach()
```

### Örnek 11 — js

```js
import {
  before,
  after,
  beforeEach,
} from "node:test";
```

### Örnek 12 — text

```text
POST /auth/login
↓
Joi
↓
service
↓
cookie
↓
Response
```
