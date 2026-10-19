# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — text

```text
Ada@Example.com
```

### Örnek 2 — text

```text
ada@example.com
```

### Örnek 3 — text

```text
"  ada@example.com  "
```

### Örnek 4 — text

```text
baştaki ve sondaki boşlukları kaldır
              ↓
küçük harfe dönüştür
```

### Örnek 5 — js

```js
const email = "  Ada@Example.com  ";

const normalizedEmail = email.trim().toLowerCase();

console.log(normalizedEmail); // ada@example.com
```

### Örnek 6 — text

```text
"  email-degil  "
```

### Örnek 7 — js

```js
email: {
  type: String,
  required: true,
  trim: true,
  lowercase: true,
  unique: true,
}
```

### Örnek 8 — js

```js
const existingUser = await User.findOne({ email });
```

### Örnek 9 — text

```text
İstek A → aynı e-posta var mı? → yok
İstek B → aynı e-posta var mı? → yok
```

### Örnek 10 — text

```text
ada@example.com
```

### Örnek 11 — text

```text
register → normalize et → kaydet
login    → normalize et → ara
```

### Örnek 12 — text

```text
name
email
passwordHash
```
