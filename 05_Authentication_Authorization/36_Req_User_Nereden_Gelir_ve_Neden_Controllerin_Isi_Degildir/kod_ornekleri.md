# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — js

```js
export const getCurrentUser = (req, res) => {
  res.status(200).json({ data: toPublicUser(req.user) });
};
```

### Örnek 2 — js

```js
req.user = user;
```

### Örnek 3 — text

```text
GET /users/me
      ↓
authenticate — kimlik doğrulama
      ↓
req.user = Ada'nın kullanıcı kaydı
      ↓
getCurrentUser — yanıtı hazırlama
```

### Örnek 4 — js

```js
router.get("/me", authenticate, getCurrentUser);
```

### Örnek 5 — js

```js
res.status(200).json({ data: toPublicUser(req.user) });
```

### Örnek 6 — js

```js
req.auth = {
  userId: user._id.toString(),
  role: user.role,
};
```
