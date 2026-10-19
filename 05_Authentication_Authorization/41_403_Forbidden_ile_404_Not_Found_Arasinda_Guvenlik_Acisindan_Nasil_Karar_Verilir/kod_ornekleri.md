# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — http

```http
401 Unauthorized
```

### Örnek 2 — http

```http
GET /admin/access-check
```

### Örnek 3 — http

```http
403 Forbidden
```

### Örnek 4 — js

```js
const movie = await Movie.findOne({
  _id: movieId,
  owner: req.user._id,
});
```

### Örnek 5 — text

```text
Kayıt gerçekten yok.
Kayıt var ama bu kullanıcıya ait değil.
```
