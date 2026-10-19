# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — text

```text
Ada → POST /auth/login → 200 OK

Ada → sonraki Request → ?
```

### Örnek 2 — text

```text
Giriş başarılı
       ↓
Sunucu yeni bir oturum kaydı oluşturur
       ↓
Bu kayda rastgele bir oturum kimliği bağlanır
       ↓
Tarayıcı sonraki uygun istekte kimliği geri gönderir
       ↓
Sunucu oturum kaydından kullanıcının kim olduğunu bulur
```

### Örnek 3 — text

```text
Tarayıcının taşıdığı: rastgele oturum kimliği
Sunucunun sakladığı: o kimliğe bağlı userId ve oturum bilgisi
```

### Örnek 4 — text

```text
Cookie → oturum kimliğini taşıyabilir
Session → sunucunun yönettiği oturumdur
```
