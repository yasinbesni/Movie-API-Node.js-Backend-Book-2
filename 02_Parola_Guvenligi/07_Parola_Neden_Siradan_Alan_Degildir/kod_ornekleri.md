# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — js

```js
await User.create({
  name,
  email,
  password,
});
```

### Örnek 2 — text

```text
Ada kayıt olur
  ↓
Parola, parola hashing işleminden geçer
  ↓
Veritabanında passwordHash saklanır

Ada giriş yapar
  ↓
Gönderdiği parola, saklanan hash'e karşı doğrulanır
  ↓
Eşleşiyor / eşleşmiyor
```
