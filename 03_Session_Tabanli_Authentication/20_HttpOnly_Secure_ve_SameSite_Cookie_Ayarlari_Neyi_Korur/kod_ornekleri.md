# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — js

```js
cookie: {
  httpOnly: true,
}
```

### Örnek 2 — js

```js
cookie: {
  secure: true,
}
```

### Örnek 3 — js

```js
nodeEnv: process.env.NODE_ENV ?? "development",
```

### Örnek 4 — js

```js
const isProduction = env.nodeEnv === "production";

app.use(
  session({
    name: isProduction ? "__Host-sid" : "sid",
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: env.mongodbUrl,
    }),
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 1000 * 60 * 60 * 8,
    },
  }),
);
```

### Örnek 5 — js

```js
app.set("trust proxy", 1);
```
