# Bölümdeki kod ve istek örnekleri

Bu örnekleri bölümdeki sırayla, **kendi Movie API çalışma kopyanıza** uygulayın. Bazı parçalar var olan bir dosyanın içine eklenir; tek başlarına çalıştırılmaz.

### Örnek 1 — json

```json
{
  "avatar": "...binary image..."
}
```

### Örnek 2 — text

```text
multipart/form-data
```

### Örnek 3 — text

```text
Part 1
name = Ada

Part 2
avatar = profile.png
Content-Type: image/png
(binary bytes)
```

### Örnek 4 — js

```js
const formData = new FormData();
formData.append("avatar", file);

await fetch("/users/me/avatar", {
  method: "POST",
  body: formData,
  credentials: "include",
});
```

### Örnek 5 — text

```text
multipart/form-data
```

### Örnek 6 — js

```js
app.use(express.json());
```

### Örnek 7 — text

```text
req.file
req.files
req.body
```

### Örnek 8 — text

```text
çok büyük dosya → memory/disk tüketimi
beklenmeyen file type
zararlı içerik
aynı filename ile overwrite
path traversal
public bucket yanlış izinleri
image parser açıkları
```

### Örnek 9 — text

```text
Content-Type: image/png
```

### Örnek 10 — text

```text
örneğin 2 MB
```

### Örnek 11 — text

```text
beklenen maksimumu açıkça sınırla
```

### Örnek 12 — http

```http
PATCH /users/me
Content-Type: application/json
```

### Örnek 13 — http

```http
POST /users/me/avatar
Content-Type: multipart/form-data
```
