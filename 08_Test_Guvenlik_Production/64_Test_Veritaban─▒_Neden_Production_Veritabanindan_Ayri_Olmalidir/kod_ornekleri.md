# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — js

```js
await User.deleteMany({});
```

### Örnek 2 — env

```env
NODE_ENV=test
TEST_MONGODB_URI=mongodb://.../movie_api_test
```

### Örnek 3 — js

```js
const mongoUri =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI;
```

### Örnek 4 — js

```js
if (process.env.NODE_ENV !== "test") {
  throw new Error(
    "Testler yalnız NODE_ENV=test ile çalıştırılabilir.",
  );
}

if (!process.env.TEST_MONGODB_URI) {
  throw new Error("TEST_MONGODB_URI gerekli.");
}
```

### Örnek 5 — js

```js
if (!process.env.TEST_MONGODB_URI.includes("_test")) {
  throw new Error("Güvenli test database adı bulunamadı.");
}
```

### Örnek 6 — js

```js
before(async () => {
  await mongoose.connect(
    process.env.TEST_MONGODB_URI,
  );
});

after(async () => {
  await mongoose.connection.close();
});
```

### Örnek 7 — text

```text
SMTP real provider
```

### Örnek 8 — text

```text
forgot-password çağrıldı
↓
fake outbox'ta 1 reset maili oluştu
```

### Örnek 9 — text

```text
production DB
≠
test DB
```
