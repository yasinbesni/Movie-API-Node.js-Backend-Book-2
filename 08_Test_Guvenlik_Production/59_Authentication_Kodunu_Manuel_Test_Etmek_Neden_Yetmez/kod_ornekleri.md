# Bölümdeki kod ve istek örnekleri

Bu örnekleri bölümdeki sırayla, **kendi Movie API çalışma kopyanıza** uygulayın. Bazı parçalar var olan bir dosyanın içine eklenir; tek başlarına çalıştırılmaz.

### Örnek 1 — text

```text
access token yok
access token expired
access token invalid
User silinmiş
User inactive
authVersion değişmiş
normal user admin route'a gidiyor
owner başka kullanıcı
```

### Örnek 2 — text

```text
cookie adı değişti
↓
her protected route 401
```

### Örnek 3 — text

```text
role kontrolünde hata
↓
normal user admin işlemi yapabiliyor
```

### Örnek 4 — text

```text
"aynı email ikinci kez register olamaz"
```

### Örnek 5 — text

```text
unit test
→ küçük fonksiyon

integration test
→ Express + middleware + database

end-to-end
→ gerçek deployment + frontend + dış servisler
```

### Örnek 6 — text

```text
register 201
invalid register 400
duplicate email 409
login 200
wrong password 401
protected route without auth 401
normal user admin route 403
owner kendi resource'unu update eder
başka owner update edemez
refresh rotation çalışır
logout sonrası refresh yapılamaz
password reset eski oturumları invalid eder
```

### Örnek 7 — text

```text
kendi test database'i
+
kontrollü setup/cleanup
```

### Örnek 8 — text

```text
sendEmail()
saveAvatar()
```
