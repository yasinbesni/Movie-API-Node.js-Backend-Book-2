# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — js

```js
owner: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  index: true,
},
```

### Örnek 2 — json

```json
{
  "title": "Arrival",
  "releaseYear": 2016,
  "voteAverage": 7.9,
  "owner": "baska-bir-kullanicinin-id-degeri"
}
```

### Örnek 3 — js

```js
export const createMovieService = async (payload, userId) => {
  const movie = new Movie({
    title: payload.title,
    releaseYear: payload.releaseYear,
    voteAverage: payload.voteAverage,
    owner: userId,
  });

  await movie.save();
  return movie;
};
```

### Örnek 4 — js

```js
const movie = await createMovieService(
  req.body,
  req.user._id,
);
```

### Örnek 5 — js

```js
export const updateMovieByIdService = async (
  movieId,
  userId,
  payload,
) => {
  return Movie.findOneAndUpdate(
    { _id: movieId, owner: userId },
    { $set: payload },
    { returnDocument: "after", runValidators: true },
  ).exec();
};

export const deleteMovieByIdService = async (
  movieId,
  userId,
) => {
  return Movie.findOneAndDelete({
    _id: movieId,
    owner: userId,
  }).exec();
};
```

### Örnek 6 — js

```js
// updateMovieById içindeki çağrı:
await updateMovieByIdService(movieId, req.user._id, req.body);

// deleteMovieById içindeki çağrı:
await deleteMovieByIdService(movieId, req.user._id);
```

### Örnek 7 — js

```js
import { authenticate } from "../middlewares/authenticate.js";
```

### Örnek 8 — js

```js
router.get("/", getMovies);
router.get("/:movieId", getMovieById);

router.post("/", authenticate, validateBody(createMovieSchema), createMovie);
router.patch("/:movieId", authenticate, validateBody(updateMovieSchema), updateMovieById);
router.delete("/:movieId", authenticate, deleteMovieById);
```
