# Bölümdeki kod ve istek örnekleri

Bu örnekleri bölümdeki sırayla, **kendi Movie API çalışma kopyanıza** uygulayın. Bazı parçalar var olan bir dosyanın içine eklenir; tek başlarına çalıştırılmaz.

### Örnek 1 — text

```text
JWT_ACCESS_SECRET
SESSION_SECRET
CSRF_SECRET
SMTP_PASS
MongoDB credential
storage API key
```

### Örnek 2 — text

```text
HttpOnly
Secure
uygun SameSite
mümkünse dar Path
```

### Örnek 3 — js

```js
cors({
  origin: env.frontendOrigin,
  credentials: true,
});
```

### Örnek 4 — text

```text
SameSite
CSRF token
Origin politikası
sıkı CORS
```

### Örnek 5 — text

```text
/auth/login
/auth/register
/auth/forgot-password
/auth/resend-verification
/auth/refresh
```

### Örnek 6 — text

```text
access token kısa ömürlü
refresh token süreli
rotation çalışıyor
reuse detection family revoke ediyor
logout refresh'i revoke ediyor
password reset authVersion artırıyor
inactive User authentication'dan geçmiyor
```

### Örnek 7 — text

```text
MemoryStore yok
session id login sonrası regenerate
logout store kaydını siliyor
```

### Örnek 8 — text

```text
users.email unique
refreshTokens.tokenHash unique
watchlistItems userId+movieId unique
reviews userId+movieId unique
owner/userId query index'leri
```

### Örnek 9 — text

```text
stack trace
MongoDB connection string
JWT secret detail
SMTP error credential
filesystem path
```

### Örnek 10 — text

```text
login failure rate
refresh reuse
5xx artışı
SMTP failure
session/token store failure
DB latency
rate-limit hit
```

### Örnek 11 — text

```text
HTTPS frontend URL
süreli
tek kullanımlık
raw token DB'de yok
```

### Örnek 12 — text

```text
file size limit
file count limit
type allowlist
gerçek içerik doğrulama stratejisi
server-generated object key
private/public storage permission
orphan cleanup
```

### Örnek 13 — bash

```bash
npm audit
```

### Örnek 14 — text

```text
[ ] secrets repository dışında
[ ] HTTPS zorunlu
[ ] Secure + HttpOnly cookie
[ ] CORS allowlist
[ ] CSRF stratejisi test edildi
[ ] auth rate limits aktif
[ ] Argon2id parametreleri ölçüldü
[ ] refresh rotation/reuse testleri geçiyor
[ ] password reset eski auth'u invalid ediyor
[ ] DB unique/index'ler production'da var
[ ] loglarda credential yok
[ ] email recovery akışı test edildi
[ ] upload limitleri aktif
[ ] test DB ayrı
[ ] backup/restore planı var
[ ] monitoring/alerts hazır
```
