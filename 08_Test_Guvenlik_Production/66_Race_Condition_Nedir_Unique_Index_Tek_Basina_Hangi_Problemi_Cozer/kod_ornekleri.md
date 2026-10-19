# Bölümdeki kod ve istek örnekleri

Bu örnekleri bölümdeki sırayla, **kendi Movie API çalışma kopyanıza** uygulayın. Bazı parçalar var olan bir dosyanın içine eklenir; tek başlarına çalıştırılmaz.

### Örnek 1 — text

```text
aynı user aynı filmi watchlist'e iki kez ekleyemez
```

### Örnek 2 — js

```js
const existing = await WatchlistItem.findOne({
  userId,
  movieId,
});

if (!existing) {
  await WatchlistItem.create({
    userId,
    movieId,
  });
}
```

### Örnek 3 — text

```text
Request A: findOne → yok
Request B: findOne → yok
Request A: create
Request B: create
```

### Örnek 4 — js

```js
{ userId: 1, movieId: 1 }
```

### Örnek 5 — text

```text
tek collection'da
belirli alan kombinasyonu unique olacak
```

### Örnek 6 — text

```text
Movie.ratingCount artacak
+
Review document oluşacak
```

### Örnek 7 — text

```text
stok 1'den küçük olamaz
```

### Örnek 8 — js

```js
await Movie.findByIdAndUpdate(movieId, {
  $inc: { ratingCount: 1 },
});
```

### Örnek 9 — js

```js
movie.ratingCount += 1;
await movie.save();
```

### Örnek 10 — text

```text
unique index yeterli mi?
atomic operator yeterli mi?
conditional update yeterli mi?
optimistic concurrency yeterli mi?
birden fazla write gerçekten birlikte atomik olmak zorunda mı?
```

### Örnek 11 — js

```js
findOneAndUpdate({
  tokenHash,
  usedAt: null,
  revokedAt: null,
})
```

### Örnek 12 — js

```js
const count = await WatchlistItem.countDocuments({
  userId,
  movieId,
});

assert.equal(count, 1);
```
