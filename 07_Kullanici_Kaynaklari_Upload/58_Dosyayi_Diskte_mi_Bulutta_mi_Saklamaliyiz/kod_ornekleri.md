# Bölümdeki kod ve istek örnekleri

Bu örnekleri bölümdeki sırayla, **kendi Movie API çalışma kopyanıza** uygulayın. Bazı parçalar var olan bir dosyanın içine eklenir; tek başlarına çalıştırılmaz.

### Örnek 1 — js

```js
await fs.writeFile(path, buffer);
```

### Örnek 2 — text

```text
Node A'ya upload edilen avatar
Node B'nin diskinde yok
```

### Örnek 3 — text

```text
Client
↓
API upload endpoint
↓
validation / image processing
↓
Object Storage
↓
storage key veya URL
↓
User.avatarUrl / avatarKey
```

### Örnek 4 — text

```text
storage key
public/private URL
metadata
```

### Örnek 5 — text

```text
private bucket
+
süreli signed URL
+
authorization kontrolü
```

### Örnek 6 — text

```text
yeni dosyayı upload et
↓
DB'de avatar key'i güncelle
↓
eski dosyayı silmeye çalış
```

### Örnek 7 — text

```text
avatars/user-id/uuid.webp
```

### Örnek 8 — text

```text
tek server
kalıcı attached volume
backup politikası
instance paylaşımı gerekmiyor
```
