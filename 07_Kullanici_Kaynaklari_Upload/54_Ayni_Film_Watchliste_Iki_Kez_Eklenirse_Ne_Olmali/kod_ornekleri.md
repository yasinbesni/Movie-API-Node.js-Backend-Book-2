# Bölümdeki kod ve istek örnekleri

Bu örnekleri bölümdeki sırayla, **kendi Movie API çalışma kopyanıza** uygulayın. Bazı parçalar var olan bir dosyanın içine eklenir; tek başlarına çalıştırılmaz.

### Örnek 1 — text

```text
User A + Movie X
→ tek kayıt
```

### Örnek 2 — text

```text
User B + Movie X
→ ayrı kayıt
```

### Örnek 3 — js

```js
watchlistItemSchema.index(
  { userId: 1, movieId: 1 },
  { unique: true },
);
```

### Örnek 4 — text

```text
aynı userId
+
aynı movieId
```

### Örnek 5 — js

```js
const existing = await WatchlistItem.findOne({
  userId,
  movieId,
});

if (existing) {
  throwConflict();
}
```

### Örnek 6 — text

```text
A existing bulamaz
B existing bulamaz
A create
B create
```

### Örnek 7 — js

```js
if (error?.code === 11000) {
  return res.status(409).json({
    message: "Bu film watchlist'te zaten var.",
  });
}
```

### Örnek 8 — text

```text
ilk POST → 201
ikinci POST → 409
```

### Örnek 9 — text

```text
ilk POST → 201
ikinci POST → mevcut kaydı 200 ile döndür
```

### Örnek 10 — js

```js
$addToSet: { watchlist: movieId }
```
