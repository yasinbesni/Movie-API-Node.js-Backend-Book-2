# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — http

```http
Set-Cookie: sid=ornekOturumDegeri; Path=/; HttpOnly; SameSite=Lax
```

### Örnek 2 — http

```http
Cookie: sid=ornekOturumDegeri
```

### Örnek 3 — text

```text
Sayfadaki JavaScript cookie değerini okuyamaz.

Tarayıcı uygun HTTP isteğine cookie'yi yine ekleyebilir.
```

### Örnek 4 — js

```js
fetch("https://api.example.com/users/me", {
  credentials: "include",
});
```

### Örnek 5 — js

```js
axios.get("https://api.example.com/users/me", {
  withCredentials: true,
});
```
