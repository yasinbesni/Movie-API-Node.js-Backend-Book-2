# Bölümdeki kod ve istek örnekleri

Bu örnekleri bölümdeki sırayla, **kendi Movie API çalışma kopyanıza** uygulayın. Bazı parçalar var olan bir dosyanın içine eklenir; tek başlarına çalıştırılmaz.

### Örnek 1 — text

```text
Movie oluştur
Movie listele
Movie güncelle
Movie sil
```

### Örnek 2 — text

```text
Request'i kim gönderdi?
Kimliğini nasıl kanıtladı?
Oturumu nasıl sürdürüyor?
Bu işlemi yapma yetkisi var mı?
Resource kime ait?
Hesap nasıl doğrulanır ve kurtarılır?
Credential çalınırsa nasıl sınırlandırılır?
Bu davranışlar otomatik olarak nasıl test edilir?
```

### Örnek 3 — text

```text
src/
├── index.js          # MongoDB bağlantısı ve listen()
├── server.js         # Express app, middleware ve Router
├── config/
│   └── env.js
├── controllers/
│   ├── auth.js
│   ├── movies.js
│   ├── users.js
│   ├── watchlist.js
│   └── reviews.js
├── services/
│   ├── auth.js
│   ├── movies.js
│   ├── users.js
│   ├── watchlist.js
│   ├── reviews.js
│   ├── email.js
│   └── files.js
├── db/
│   ├── initMongoConnection.js
│   └── models/
│       ├── user.js
│       ├── movie.js
│       ├── refreshToken.js
│       ├── accountToken.js
│       ├── watchlistItem.js
│       ├── review.js
│       └── auditEvent.js
├── middlewares/
│   ├── authenticate.js
│   ├── requireRole.js
│   ├── requireVerifiedEmail.js
│   ├── validateBody.js
│   ├── uploadAvatar.js
│   ├── csrf.js
│   └── errorHandler.js
├── routers/
│   ├── auth.js
│   ├── users.js
│   ├── movies.js
│   ├── watchlist.js
│   ├── reviews.js
│   └── admin.js
├── utils/
│   ├── password.js
│   ├── token.js
│   ├── authCookies.js
│   └── toPublicUser.js
└── validation/
    ├── auth.js
    ├── users.js
    ├── movies.js
    └── reviews.js

test/
├── password.test.js
├── auth.integration.test.js
├── authorization.integration.test.js
└── watchlist.integration.test.js
```

### Örnek 4 — text

```text
POST /auth/register
→ hesap oluştur
→ password hash
→ verification token üret

POST /auth/login
→ e-posta + parola doğrula
→ Session tabanlı oturum oluştur
→ sid çerezi

POST /auth/jwt/login
→ e-posta + parola doğrula
→ access JWT + refresh token
→ HttpOnly cookie

POST /auth/refresh
→ refresh hash doğrula
→ rotation
→ yeni access + refresh

POST /auth/logout
→ refresh revoke
→ auth cookie'lerini temizle

POST /auth/verify-email
→ süreli tek-kullanımlık token
→ isEmailVerified=true

POST /auth/resend-verification
→ eski tokenları geçersiz kıl
→ yeni mail

POST /auth/forgot-password
→ generic Response
→ verified hesap varsa reset token

POST /auth/reset-password
→ token tüket
→ yeni passwordHash
→ authVersion++
→ refresh tokenları revoke
```

### Örnek 5 — text

```text
Request body
↓
Joi validation
↓
email normalize
↓
password Argon2id hash
↓
User.create
↓
verification token hash DB
↓
raw token email
↓
public User Response
```

### Örnek 6 — text

```text
email ile User bul
↓
+passwordHash seç
↓
Argon2 verify
↓
account active mi?
↓
access JWT üret
↓
opaque refresh token üret
↓
refresh hash DB
↓
HttpOnly cookies
```

### Örnek 7 — text

```text
access cookie
↓
JWT verify
↓
sub
↓
User DB lookup
↓
isActive
↓
authVersion kontrolü
↓
req.user
↓
authorization
↓
Controller
```

### Örnek 8 — text

```text
POST /movies
→ authenticated + verified email
→ owner=req.user._id

GET /movies
→ herkese açık ortak katalog (birinci kitaptaki davranış korunur)

GET /users/me/movies
→ owner=req.user._id ile kullanıcıya ait eklenen filmler

PATCH /movies/:movieId
→ _id + owner birlikte filtre

DELETE /movies/:movieId
→ _id + owner birlikte filtre
```

### Örnek 9 — text

```text
/admin/...
```

### Örnek 10 — text

```text
WatchlistItem
userId + movieId
compound unique
```

### Örnek 11 — text

```text
Review
userId + movieId + rating + text
compound unique
```

### Örnek 12 — text

```text
role
isEmailVerified
isActive
authVersion
avatarUrl
```

### Örnek 13 — text

```text
password reset
account disable
credential compromise
```

### Örnek 14 — text

```text
R1
↓ kullanıldı
R2
↓ kullanıldı
R3
```

### Örnek 15 — text

```text
raw değer → yalnız client
hash → DB
familyId → rotation zinciri
usedAt → tekrar kullanım sinyali
revokedAt → invalidation
expiresAt → zaman sınırı
```

### Örnek 16 — text

```text
reuse detected
↓
family revoke
↓
audit event
↓
yeniden login
```

### Örnek 17 — text

```text
HttpOnly
Secure
SameSite policy
mümkün olduğunca dar Path
HTTPS
```

### Örnek 18 — text

```text
SameSite
+
CSRF token
+
CORS allowlist
+
Origin politikası
```

### Örnek 19 — text

```text
POST /users/me/avatar
↓
authenticate
↓
Multer size/file count limit
↓
type + içerik doğrulama stratejisi
↓
server-generated storage key
↓
object storage
↓
User.avatarUrl/avatarKey
```

### Örnek 20 — text

```text
[ ] register 201
[ ] invalid register 400
[ ] duplicate email 409
[ ] passwordHash Response'ta yok
[ ] login doğru credential 200
[ ] login yanlış password 401
[ ] olmayan email aynı public login hatasını verir
[ ] protected route auth olmadan 401
[ ] inactive user 401
[ ] authVersion mismatch 401
[ ] user admin route'a 403
[ ] owner kendi Movie'sini update eder
[ ] başka owner update edemez
[ ] Movie listesi user scope dışında veri döndürmez
[ ] watchlist duplicate engellenir
[ ] review duplicate policy çalışır
[ ] refresh rotation çalışır
[ ] eski refresh reuse family revoke eder
[ ] logout refresh token'ı revoke eder
[ ] forgot-password account enumeration yapmaz
[ ] reset token tek kullanımlıdır
[ ] password reset eski auth'u geçersiz kılar
[ ] upload size/type limitleri çalışır
[ ] CSRF token olmadan state-changing cookie request reddedilir
```

### Örnek 21 — text

```text
Credential nerede saklanıyor?
Çalınırsa ne kadar yaşar?
Nasıl revoke edilir?
User kapatılırsa eski token ne olur?
Role değişirse ne kadar sürede etkili olur?
Private resource query'si owner scope'u nasıl koruyor?
Database unique invariant'ları gerçekten index ile korunuyor mu?
Loglarda secret sızıyor mu?
Email reset token'ı tekrar kullanılabiliyor mu?
Testler production DB'ye ulaşabilir mi?
```

### Örnek 22 — text

```text
cache
queue ve background jobs
email outbox
real-time iletişim
containerization
CI/CD
gözlemlenebilirlik
ölçekleme
dağıtık servisler
```

### Örnek 23 — text

```text
kimlik
↓
credential doğrulama
↓
oturum/token yaşam döngüsü
↓
güncel user context
↓
yetki ve ownership
↓
veri bütünlüğü
↓
test
↓
production güvenliği
```
