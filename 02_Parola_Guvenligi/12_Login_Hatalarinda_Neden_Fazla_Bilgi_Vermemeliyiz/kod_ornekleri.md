# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — text

```text
Bu e-posta kayıtlı değil.
```

### Örnek 2 — text

```text
Parolanız yanlış.
```

### Örnek 3 — http

```http
401 Unauthorized
```

### Örnek 4 — json

```json
{
  "message": "E-posta veya parola hatalı."
}
```

### Örnek 5 — js

```js
const invalidCredentials = () => {
  const error = new Error("E-posta veya parola hatalı.");
  error.status = 401;
  return error;
};
```

### Örnek 6 — text

```text
Hesap yok         → parola doğrulaması çalışmaz
Hesap var, yanlış → parola doğrulaması çalışır
```

### Örnek 7 — text

```text
AUTH_LOGIN_FAILED
reason: INVALID_PASSWORD
```

### Örnek 8 — text

```text
E-posta veya parola hatalı.
```
