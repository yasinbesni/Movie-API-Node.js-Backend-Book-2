# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — http

```http
Cookie: sid=abc123
```

### Örnek 2 — text

```text
Ada'nın tarayıcısı           Sunucu
Cookie: sid=abc123  ──────► Oturum kaydını bul
                             abc123 → userId: 66f...
                             kullanıcı kaydı: Ada
```

### Örnek 3 — text

```text
Telefon       sid=A1 ─┐
                      ├──► userId: Ada
Bilgisayar    sid=B2 ─┘
```

### Örnek 4 — js

```js
req.session.userId = user._id.toString();
```
