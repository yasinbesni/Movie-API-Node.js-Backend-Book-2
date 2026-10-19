# Bölümdeki kod ve istek örnekleri

Bu örnekleri bölümdeki sırayla, **kendi Movie API çalışma kopyanıza** uygulayın. Bazı parçalar var olan bir dosyanın içine eklenir; tek başlarına çalıştırılmaz.

### Örnek 1 — text

```text
User
↕
Movie
```

### Örnek 2 — js

```js
watchlist: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
  },
]
```

### Örnek 3 — text

```text
ne zaman eklendi?
hangi listede?
öncelik?
kişisel not?
```

### Örnek 4 — js

```js
const watchlistItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);
```

### Örnek 5 — text

```text
User A, Movie X'i watchlist'ine ekledi.
```

### Örnek 6 — text

```text
watchlist büyüse bile User document şişmez
createdAt doğal olarak tutulur
compound unique index kurulabilir
pagination kolaylaşır
ilişkiye ileride alan eklenebilir
```

### Örnek 7 — text

```text
ek collection
ek sorgu
populate veya aggregation ihtiyacı
```

### Örnek 8 — http

```http
POST /watchlist/:movieId
```

### Örnek 9 — http

```http
GET /watchlist
```

### Örnek 10 — http

```http
DELETE /watchlist/:movieId
```

### Örnek 11 — js

```js
req.user._id
```

### Örnek 12 — js

```js
export const addToWatchlist = async (
  userId,
  movieId,
) => {
  const movieExists = await Movie.exists({
    _id: movieId,
  });

  if (!movieExists) {
    const error = new Error("Film bulunamadı.");
    error.status = 404;
    throw error;
  }

  return WatchlistItem.create({
    userId,
    movieId,
  });
};
```

### Örnek 13 — js

```js
export const getMyWatchlist = async (
  userId,
  { page = 1, limit = 20 },
) => {
  const skip = (page - 1) * limit;

  const filter = { userId };

  const [items, total] = await Promise.all([
    WatchlistItem.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("movieId"),
    WatchlistItem.countDocuments(filter),
  ]);

  return { items, total };
};
```

### Örnek 14 — js

```js
export const removeFromWatchlist = async (
  userId,
  movieId,
) => {
  return WatchlistItem.findOneAndDelete({
    userId,
    movieId,
  });
};
```
