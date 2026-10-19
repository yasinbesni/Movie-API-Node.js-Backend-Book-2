# Bölümdeki kod ve istek örnekleri

Bu örnekleri bölümdeki sırayla, **kendi Movie API çalışma kopyanıza** uygulayın. Bazı parçalar var olan bir dosyanın içine eklenir; tek başlarına çalıştırılmaz.

### Örnek 1 — text

```text
credential yok
→ 401

credential var ama role yetersiz
→ 403

private resource başka owner'a ait
→ 404
```

### Örnek 2 — js

```js
it("auth olmadan /users/me 401 döner", async () => {
  const response = await request(app)
    .get("/users/me");

  assert.equal(response.status, 401);
});
```

### Örnek 3 — js

```js
const agent = await loginAsUser({
  role: "user",
});
```

### Örnek 4 — js

```js
const response = await agent
  .delete("/admin/movies/...");

assert.equal(response.status, 403);
```

### Örnek 5 — text

```text
User A
→ Movie A oluşturdu

User B
→ login oldu
→ Movie A'yı PATCH etmeye çalıştı
```

### Örnek 6 — http

```http
404 Not Found
```

### Örnek 7 — js

```js
const response = await userBAgent
  .patch(`/movies/${movieA._id}`)
  .send({
    title: "Yetkisiz değişiklik",
  });

assert.equal(response.status, 404);
```

### Örnek 8 — js

```js
const response = await userAAgent
  .patch(`/movies/${movieA._id}`)
  .send({
    title: "Yeni başlık",
  });

assert.equal(response.status, 200);
assert.equal(
  response.body.data.title,
  "Yeni başlık",
);
```

### Örnek 9 — http

```http
GET /movies
```

### Örnek 10 — text

```text
owner = User A
```

### Örnek 11 — js

```js
isActive = false
```

### Örnek 12 — http

```http
401
```

### Örnek 13 — js

```js
$inc: { authVersion: 1 }
```

### Örnek 14 — http

```http
401
```
