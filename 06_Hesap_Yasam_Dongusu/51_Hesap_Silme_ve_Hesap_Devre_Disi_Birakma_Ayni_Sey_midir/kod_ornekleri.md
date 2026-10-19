# Bölümdeki kod ve istek örnekleri

Bu örnekleri bölümdeki sırayla, **kendi Movie API çalışma kopyanıza** uygulayın. Bazı parçalar var olan bir dosyanın içine eklenir; tek başlarına çalıştırılmaz.

### Örnek 1 — js

```js
await User.findByIdAndDelete(req.user._id);
```

### Örnek 2 — text

```text
Movie.owner
RefreshToken
verification/reset kayıtları
diğer user-referenced veriler
```

### Örnek 3 — js

```js
isActive: {
  type: Boolean,
  default: true,
},

deactivatedAt: {
  type: Date,
  default: null,
},
```

### Örnek 4 — js

```js
await User.findByIdAndUpdate(req.user._id, {
  $set: {
    isActive: false,
    deactivatedAt: new Date(),
  },
  $inc: {
    authVersion: 1,
  },
});
```

### Örnek 5 — js

```js
if (!user || !user.isActive) {
  throwUnauthorized();
}
```

### Örnek 6 — text

```text
önce deactivate
↓
belirli retention süresi
↓
anonimleştirme veya hard delete
```

### Örnek 7 — js

```js
isActive = true
```

### Örnek 8 — js

```js
clearAuthCookies(res);
```

### Örnek 9 — http

```http
204 No Content
```

### Örnek 10 — js

```js
if (!user.isActive) {
  throwUnauthorized();
}
```
