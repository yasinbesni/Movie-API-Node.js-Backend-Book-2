# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — bash

```bash
npm install argon2
```

### Örnek 2 — text

```text
src/utils/password.js
```

### Örnek 3 — js

```js
import argon2 from "argon2";

const HASH_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export const hashPassword = async (password) => {
  return argon2.hash(password, HASH_OPTIONS);
};

export const verifyPassword = async (passwordHash, password) => {
  return argon2.verify(passwordHash, password);
};
```

### Örnek 4 — js

```js
import {
  hashPassword,
  verifyPassword,
} from "../utils/password.js";

const password = "uzun-bir-deneme-parolasi";

const firstHash = await hashPassword(password);
const secondHash = await hashPassword(password);

console.log("Hash'ler eşit mi?", firstHash === secondHash);
console.log("Doğru parola:", await verifyPassword(firstHash, password));
console.log(
  "Yanlış parola:",
  await verifyPassword(firstHash, "yanlis-deneme-parolasi"),
);
```

### Örnek 5 — bash

```bash
node src/scripts/tryPasswords.js
```

### Örnek 6 — text

```text
Hash'ler eşit mi? false
Doğru parola: true
Yanlış parola: false
```
