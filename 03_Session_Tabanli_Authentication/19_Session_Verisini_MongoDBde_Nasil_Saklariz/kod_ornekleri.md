# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — bash

```bash
npm install connect-mongo
```

### Örnek 2 — js

```js
import MongoStore from "connect-mongo";
```

### Örnek 3 — js

```js
app.use(
  session({
    name: "sid",
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: env.mongodbUrl,
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 8,
    },
  }),
);
```

### Örnek 4 — text

```text
users
  Ada'nın hesabı

sessions
  Ada'nın bilgisayarındaki oturum
  Ada'nın telefonundaki oturum
  sona erme bilgileri
```
