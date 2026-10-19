# Bölümdeki kod ve istek örnekleri

Bu örnekleri bölümdeki sırayla, **kendi Movie API çalışma kopyanıza** uygulayın. Bazı parçalar var olan bir dosyanın içine eklenir; tek başlarına çalıştırılmaz.

### Örnek 1 — js

```js
const movieSchema = new mongoose.Schema({
  title: String,
  reviews: [
    {
      userId: ObjectId,
      rating: Number,
      text: String,
    },
  ],
});
```

### Örnek 2 — js

```js
const reviewSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
  },
  { timestamps: true },
);
```

### Örnek 3 — text

```text
bir user + bir movie
→ en fazla bir review
```

### Örnek 4 — js

```js
reviewSchema.index(
  { userId: 1, movieId: 1 },
  { unique: true },
);
```

### Örnek 5 — json

```json
{
  "rating": 9,
  "text": "Görsel anlatımı çok güçlüydü."
}
```

### Örnek 6 — http

```http
POST /movies/:movieId/reviews
```

### Örnek 7 — js

```js
return Review.create({
  userId: req.user._id,
  movieId: req.params.movieId,
  rating,
  text,
});
```

### Örnek 8 — text

```text
Review collection
↓
$match movieId
↓
$avg rating
```

### Örnek 9 — text

```text
ratingAverage
ratingCount
```

### Örnek 10 — text

```text
review sayısı çok küçük ve bounded
review her zaman Movie ile birlikte okunuyor
bağımsız pagination gerekmiyor
review ayrı sorgulanmıyor
```

### Örnek 11 — text

```text
büyüyebilir
kullanıcıya ait
moderasyon görebilir
pagination ister
```

### Örnek 12 — js

```js
Review.findOneAndUpdate(
  {
    _id: reviewId,
    userId: req.user._id,
  },
  update,
  { new: true, runValidators: true },
);
```
