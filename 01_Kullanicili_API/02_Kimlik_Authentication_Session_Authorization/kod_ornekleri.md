# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — json

```json
{
  "email": "ada@example.com",
  "password": "..."
}
```

### Örnek 2 — text

```text
"Ada'nın hesabına giriş yapmak istiyorum."
```

### Örnek 3 — text

```text
Hesap bulundu
      ↓
Parola doğrulandı mı?
      ├── Hayır → giriş reddedilir
      └── Evet → hesap doğrulandı
```

### Örnek 4 — http

```http
GET /watchlist
```

### Örnek 5 — text

```text
Giriş başarılı
      ↓
Yeni bir istek geldi
      ↓
Bu istek doğrulanmış hangi hesaba bağlı?
```

### Örnek 6 — text

```text
İsteği gönderen: Deniz
İstenen veri: Ada'nın kişisel listesi
```

### Örnek 7 — text

```text
Authentication → Hangi hesapla işlem yapılıyor?
Authorization  → Bu hesap bu işlemi yapabilir mi?
```

### Örnek 8 — text

```text
Ada → kendi listesi    → erişebilir
Deniz → Ada'nın listesi → erişemez
```
