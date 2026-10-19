# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — http

```http
GET /movies
GET /users/me/movies
```

### Örnek 2 — js

```js
export const getMyMoviesService = async (userId, query) => {
  const { page, limit } = parsePaginationParams(query);
  const filter = { owner: userId };
  const skip = (page - 1) * limit;

  const [totalItems, movies] = await Promise.all([
    Movie.countDocuments(filter).exec(),
    Movie.find(filter)
      .forMovieList()
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
  ]);

  const pagination = calculatePaginationData(totalItems, limit, page);

  return {
    movies,
    meta: { page, limit, totalItems, ...pagination },
  };
};
```

### Örnek 3 — js

```js
const filter = { owner: userId };
```

### Örnek 4 — js

```js
export const getMyMovies = async (req, res) => {
  const { movies, meta } = await getMyMoviesService(
    req.user._id,
    req.query,
  );

  return res.status(200).json({
    message: "Eklediğiniz filmler getirildi.",
    data: movies,
    meta,
  });
};
```

### Örnek 5 — js

```js
import { getMyMovies } from "../controllers/movies.js";
```

### Örnek 6 — js

```js
router.get("/me/movies", authenticate, getMyMovies);
```

### Örnek 7 — http

```http
GET /users/me/movies?owner=deniz-id&page=1
```

### Örnek 8 — js

```js
const filter = { owner: userId, ...req.query };
```

### Örnek 9 — text

```text
GET /movies
  → herkesin görebildiği film kataloğu

GET /users/me/movies
  → owner = doğrulanmış kullanıcı
  → aynı owner filtresiyle liste ve toplam sayı
```
