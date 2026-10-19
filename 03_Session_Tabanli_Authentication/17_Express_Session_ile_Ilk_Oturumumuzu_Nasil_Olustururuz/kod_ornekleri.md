# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — bash

```bash
npm install express-session
```

### Örnek 2 — js

```js
sessionSecret: getRequiredString("SESSION_SECRET"),
```

### Örnek 3 — bash

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

### Örnek 4 — js

```js
import session from "express-session";
```

### Örnek 5 — js

```js
app.use(
  session({
    name: "sid",
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
    },
  }),
);
```

### Örnek 6 — js

```js
export const loginUser = async (req, res) => {
  const user = await authService.loginUser(req.body);

  req.session.userId = user._id.toString();

  return res.status(200).json({
    message: "Giriş başarılı.",
    data: toPublicUser(user),
  });
};
```

### Örnek 7 — http

```http
Set-Cookie: sid=...; Path=/; HttpOnly; SameSite=Lax
```

### Örnek 8 — js

```js
app.get("/debug/session", (req, res) => {
  res.json({
    userId: req.session.userId ?? null,
  });
});
```
