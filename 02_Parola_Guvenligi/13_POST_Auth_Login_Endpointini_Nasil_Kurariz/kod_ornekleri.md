# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — http

```http
POST /auth/login
Content-Type: application/json
```

### Örnek 2 — json

```json
{
  "email": "ADA@EXAMPLE.COM",
  "password": "uzun-bir-deneme-parolasi"
}
```

### Örnek 3 — js

```js
import { User } from "../db/models/user.js";
import {
  hashPassword,
  verifyPassword,
} from "../utils/password.js";

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("Bu e-posta adresiyle bir hesap zaten var.");
    error.status = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);
  return User.create({ name, email, passwordHash });
};

const invalidCredentials = () => {
  const error = new Error("E-posta veya parola hatalı.");
  error.status = 401;
  return error;
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email })
    .select("+passwordHash");

  if (!user) {
    throw invalidCredentials();
  }

  const isPasswordValid = await verifyPassword(
    user.passwordHash,
    password,
  );

  if (!isPasswordValid) {
    throw invalidCredentials();
  }

  return user;
};
```

### Örnek 4 — js

```js
export const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});
```

### Örnek 5 — js

```js
import * as authService from "../services/auth.js";
import { toPublicUser } from "../utils/toPublicUser.js";

export const registerUser = async (req, res) => {
  const user = await authService.registerUser(req.body);

  return res.status(201).json({
    message: "Kullanıcı oluşturuldu.",
    data: toPublicUser(user),
  });
};

export const loginUser = async (req, res) => {
  const user = await authService.loginUser(req.body);

  return res.status(200).json({
    message: "Giriş başarılı.",
    data: toPublicUser(user),
  });
};
```

### Örnek 6 — js

```js
import { Router } from "express";
import {
  registerUser,
  loginUser,
} from "../controllers/auth.js";
import { validateBody } from "../middlewares/validateBody.js";
import {
  registerUserSchema,
  loginUserSchema,
} from "../validation/auth.js";

const router = Router();

router.post(
  "/register",
  validateBody(registerUserSchema),
  registerUser,
);

router.post(
  "/login",
  validateBody(loginUserSchema),
  loginUser,
);

export default router;
```

### Örnek 7 — js

```js
app.use("/auth", authRouter);
```

### Örnek 8 — json

```json
{
  "message": "Giriş başarılı.",
  "data": {
    "id": "...",
    "name": "Ada",
    "email": "ada@example.com",
    "createdAt": "..."
  }
}
```

### Örnek 9 — json

```json
{
  "message": "E-posta veya parola hatalı."
}
```
