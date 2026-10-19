# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — json

```json
{
  "_id": "liste-kaydi-1",
  "movieId": "film-123",
  "owner": "ada-kullanici-id"
}
```

### Örnek 2 — text

```text
İstenen kayıt kimliği
          +
Kimliği doğrulanmış kullanıcı kimliği
          ↓
      Sahiplik kontrolü
```

### Örnek 3 — js

```js
const filter = {
  _id: requestedId,
  owner: req.user._id,
};
```
