# Bölümdeki kod ve istek örnekleri

Bu örnekleri bölümdeki sırayla, **kendi Movie API çalışma kopyanıza** uygulayın. Bazı parçalar var olan bir dosyanın içine eklenir; tek başlarına çalıştırılmaz.

### Örnek 1 — text

```text
1. Review document create
2. Movie.ratingCount artır
3. Movie.ratingSum artır
```

### Örnek 2 — text

```text
Review var
ama Movie istatistiği yanlış
```

### Örnek 3 — js

```js
const session = await mongoose.startSession();

try {
  await session.withTransaction(async () => {
    await Review.create(
      [
        {
          userId,
          movieId,
          rating,
          text,
        },
      ],
      { session },
    );

    await Movie.updateOne(
      { _id: movieId },
      {
        $inc: {
          ratingCount: 1,
          ratingSum: rating,
        },
      },
      { session },
    );
  });
} finally {
  await session.endSession();
}
```

### Örnek 4 — js

```js
Review.create([doc], { session });
```

### Örnek 5 — text

```text
reset token usedAt
+
User.passwordHash update
+
authVersion increment
+
refresh token revoke
```

### Örnek 6 — text

```text
bu denormalized veriye gerçekten ihtiyacım var mı?
```
