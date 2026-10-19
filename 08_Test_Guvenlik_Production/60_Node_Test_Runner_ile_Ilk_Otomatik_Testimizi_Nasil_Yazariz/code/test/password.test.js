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
