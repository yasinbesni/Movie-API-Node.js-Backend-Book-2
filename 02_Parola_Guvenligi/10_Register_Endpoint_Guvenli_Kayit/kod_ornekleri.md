# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — http

```http
POST /auth/register
Content-Type: application/json
```

### Örnek 2 — json

```json
{
  "name": "Ada",
  "email": "ADA@EXAMPLE.COM",
  "password": "uzun-bir-deneme-parolasi"
}
```

### Örnek 3 — text

```text
POST /auth/register
       ↓
Joi doğrulaması
       ↓
Auth Controller
       ↓
Auth Service
       ↓
User Model + hashPassword()
       ↓
MongoDB
```

### Örnek 4 — text

```text
src/services/auth.js
```

### Örnek 5 — js

```js
import { User } from "../db/models/user.js";
import { hashPassword } from "../utils/password.js";

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("Bu e-posta adresiyle bir hesap zaten var.");
    error.status = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  return user;
};
```

### Örnek 6 — text

```text
src/controllers/auth.js
```

### Örnek 7 — js

```js
import * as authService from "../services/auth.js";

export const registerUser = async (req, res) => {
  const user = await authService.registerUser(req.body);

  return res.status(201).json({
    message: "Kullanıcı oluşturuldu.",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
};
```

### Örnek 8 — text

```text
src/routers/auth.js
```

### Örnek 9 — js

```js
import { Router } from "express";

import { registerUser } from "../controllers/auth.js";
import { validateBody } from "../middlewares/validateBody.js";
import { registerUserSchema } from "../validation/auth.js";

const router = Router();

router.post(
  "/register",
  validateBody(registerUserSchema),
  registerUser,
);

export default router;
```

### Örnek 10 — js

```js
import authRouter from "./routers/auth.js";
```

### Örnek 11 — js

```js
app.use("/auth", authRouter);
```

### Örnek 12 — js

```js
if (
  Number.isInteger(error.status) &&
  error.status >= 400 &&
  error.status < 500
) {
  return res.status(error.status).json({
    message: error.message,
  });
}
```

### Örnek 13 — http

```http
POST http://localhost:3000/auth/register
Content-Type: application/json
```

### Örnek 14 — json

```json
{
  "name": "Ada",
  "email": "ADA@EXAMPLE.COM",
  "password": "uzun-bir-deneme-parolasi"
}
```

### Örnek 15 — json

```json
{
  "message": "Kullanıcı oluşturuldu.",
  "data": {
    "id": "...",
    "name": "Ada",
    "email": "ada@example.com",
    "createdAt": "..."
  }
}
```

### Örnek 16 — text

```text
Kayıt isteği → User hesabı oluşturuldu
Sonraki istek → Hangi hesap gönderdi, hâlâ bilmiyoruz
```
