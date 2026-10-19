# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — text

```text
ad
email
parola
profil fotoğrafı
telefon
rol
son giriş tarihi
kişisel film listesi
```

### Örnek 2 — json

```json
{
  "name": "Ada",
  "email": "ada@example.com",
  "password": "Ornek-Uzun-Bir-Parola"
}
```

### Örnek 3 — json

```json
{
  "name": "Ada",
  "email": "ada@example.com",
  "password": "Ornek-Uzun-Bir-Parola"
}
```

### Örnek 4 — text

```text
Kayıt isteğindeki veri         Veritabanında saklanan veri
---------------------------    ---------------------------
name                           name
email                          email
password                       passwordHash
```

### Örnek 5 — json

```json
{
  "_id": "...",
  "name": "Ada",
  "email": "ada@example.com",
  "passwordHash": "<parola hash değeri>",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Örnek 6 — text

```text
İlk hedef: hesap açabilmek
     ↓
Gerekli: ad + e-posta + güvenli parola doğrulama verisi
     ↓
Henüz gerekli değil: roller, film listeleri, oturum kayıtları
```

### Örnek 7 — json

```json
{
  "data": {
    "name": "Ada",
    "email": "ada@example.com"
  }
}
```

### Örnek 8 — text

```text
passwordHash
```

### Örnek 9 — text

```text
User
├── name
├── email
├── passwordHash
├── createdAt
└── updatedAt
```
