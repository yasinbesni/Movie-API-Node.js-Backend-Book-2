# Bölüm 70 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# Son Proje: Movie API’yi Kullanıcılı ve Güvenli Bir Sisteme Nasıl Dönüştürürüz?


## Ada'nın İlk Film İsteğinden Güvenli Kullanıcı Sistemine

Ada bir film aramasıyla başlayan Movie API'de artık kendi hesabıyla giriş yapıyor; fotoğrafını yüklüyor ve filmleriyle ilgili işlemler yapmak istiyor. Son bölümde dosyaları yeniden sıralamaktan çok **bu işlemlerin birbirine gerçekten bağlanıp bağlanmadığını** sorgulayacağız. Bir özelliğin Model, Service ve Router parçalarını ayrı ayrı görmekle, Ada'nın o özelliği baştan sona kullanabilmesi aynı şey değildir.

## Aynı Movie API, Yeni Sorumluluklar

Başlangıçta Movie API, film kayıtları üzerinde oluşturma, listeleme, güncelleme ve silme işlemleri yapıyordu. Ada ve Deniz kullanıcı hesaplarıyla gelince aynı istekler için yeni sorular ortaya çıktı: İsteği kim gönderiyor? İzinli mi? Hesap kapatıldıysa eski çerez çalışacak mı? Fotoğrafın gerçek dosyası nerede?

```text
Film isteği → Kullanıcı kimliği → Yetki kontrolü → Veri işlemi
                                  ↓
                        Yanıt ve güvenlik kaydı
```

## Örnek 2

Artık başarıyı yalnız bir isteğin `200` dönmesiyle ölçemeyiz. Örneğin Deniz'in Ada'nın filmini değiştirme isteği reddedilse bile kayıt değişmişse güvenlik sağlanmış sayılmaz. Benzer şekilde Ada'nın avatarı yüklenip bir sonraki gün siliniyorsa dosya saklama özelliği güvenilir değildir.

## Final Klasör Haritası

Movie API’ye eklediğimiz bileşenlerin hedef klasör düzenini aşağıda bir arada görüyoruz. Harita, tamamlanmış dosyalarla HTTP bağlantısı veya güvenlik entegrasyonu ayrıca gereken parçaları birlikte gösterir; **yalnızca dosya adının burada bulunması özelliğin çalıştığı anlamına gelmez.** Kod deposundaki 01–70 klasörleri ayrı uygulamalar değil, **aynı projede ilerlediğimiz adımlar**. Kendi çalışma kopyanızda bu değişiklikleri sırayla birleştirip HTTP ve veritabanı testleriyle doğrulamalısınız.

Hedeflediğimiz klasör düzeni:

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
│   ├── reviews.js
│   └── support.js
├── services/
│   ├── auth.js
│   ├── movies.js
│   ├── users.js
│   ├── watchlist.js
│   ├── reviews.js
│   ├── email.js
│   ├── files.js
│   └── support.js
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
│   ├── supportRateLimit.js
│   ├── csrf.js
│   └── errorHandler.js
├── routers/
│   ├── auth.js
│   ├── users.js
│   ├── movies.js
│   ├── watchlist.js
│   ├── reviews.js
│   ├── support.js
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
    ├── reviews.js
    └── support.js

test/
├── password.test.js
├── auth.integration.test.js
├── authorization.integration.test.js
└── watchlist.integration.test.js
```

## Örnek 3

Her proje birebir aynı klasör isimlerini kullanmak zorunda değildir. Önemli olan sorumluluk sınırlarının görünür kalmasıdır.

---

## Kimlik İşlemleri İçin HTTP Yolları

```text
POST /auth/register
→ hesap oluştur
→ paroladan hash değeri üret
→ e-posta doğrulama bağlantısı ayrı akışla gönderilir

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

POST /auth/send-verification-email
→ 50. bölümdeki e-posta gönderme isteği
→ doğrulama bağlantısı hazırla ve gönder

POST /auth/forgot-password
→ generic Response
→ verified hesap varsa reset token

POST /auth/reset-password
→ belirteci tek kullanımlık olarak tüket
→ yeni passwordHash
→ authVersion sayacını artır
→ eski yenileme belirteçlerini iptal et

POST /users/me/email-change
→ giriş yapmış Ada mevcut parolasını ve yeni e-posta adresini gönderir
→ yeni adrese doğrulama kodu gider

POST /users/me/email-change/confirm
→ kod doğrulanır, e-posta adresi güncellenir
→ eski tokenlar iptal edilir ve yeniden giriş istenir

POST /support/requests  (yalnız mesaj veya isteğe bağlı taranan dosya eki)
→ giriş yapmış, e-postası doğrulanmış Ada sorunu bildirir
→ destek adresine mesaj, Ada'ya alındı bildirimi gönderilir
→ gönderim SMTP tarafından kabul edilir; kesin teslim garantisi değildir
```

## Örnek 4

Bu yollar tek bir akış gibi görünse de görevleri farklıdır: kayıt olma kimlik oluşturur, e-posta doğrulama posta kutusuna erişimi gösterir, giriş çerez üretir, yenileme belirteçleri oturumu sürdürür. **Haritadaki yol isimlerini doğrudan “hepsi uçtan uca hazır” anlamında okumayın; her biri için Router bağlantısı ve gerçek HTTP testi gerekir.**

---

## Final Kullanıcı Akışı

### Register

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

## Örnek 5

### Login

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

## Örnek 6

### Protected Request

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

## Örnek 7

Bu akışta **kimlik doğrulama (authentication)**, Ada'nın gerçekten hangi hesapla geldiğini belirler. **Yetkilendirme (authorization)** ise Ada'nın hedef veriye erişmesine izin olup olmadığını kontrol eder. Örneğin geçerli bir JWT, Deniz'in özel film kaydını düzenleme izni vermez.

---

Ada giriş yaptıktan sonra korumalı film listesini açtığında sistemin yalnız doğru JSON dönmesi yeterli değil. İstekten başlayarak aynı sırayı izleyelim: **Kimlik bilgisi doğru taşındı mı? Sunucu geçerliliği kontrol etti mi? Kullanıcı hesabı etkin mi? İstenen kaydın sahibi kim? İşlem veriyi beklenen sınırda mı değiştirdi?** Aynı zinciri Deniz'in kimlik bilgileriyle yeniden deneyince farklı sonuç beklediğimiz noktalar ortaya çıkar. Final proje, tek tek dosyaların toplamından çok bu güven sınırlarının **birlikte çalışmasıdır**.

## Film Kayıtlarında Erişim Kuralları

Normal kullanıcı için:

```text
POST /movies
→ authenticated + verified email
→ owner=req.user._id

GET /movies
→ herkese açık ortak film kataloğu

GET /users/me/movies
→ owner=req.user._id ile kullanıcıya ait eklenen filmler

PATCH /movies/:movieId
→ _id + owner birlikte filtre

DELETE /movies/:movieId
→ _id + owner birlikte filtre
```

## Örnek 8

Admin moderasyon ihtiyacı varsa ayrı namespace:

```text
/admin/...
```

## Örnek 9

ve açık role middleware kullanılır.

---

## İzleme Listesi ve Film Değerlendirmeleri

Watchlist:

```text
WatchlistItem
userId + movieId
compound unique
```

## Örnek 10

Review:

```text
Review
userId + movieId + rating + text
compound unique
```

## Örnek 11

m`, Ada'nın bir filmi kendi izleme listesine eklediğini; `Review` ise bir filme verdiği puanı ve yorumu temsil eder. Her iki kayıt da **istemcinin `userId` diye gönderdiği değere güvenmemeli**; kullanıcı kimliğini `authenticate` tarafından doğrulanan hesaptan almalıdır.

53. bölümde izleme listesi için veri modelini ve Service işlevlerini oluşturduk. 54. bölümde bu işlevleri Controller ve Router katmanlarına bağladık. Böylece `GET /watchlist`, `POST /watchlist/:movieId` ve `DELETE /watchlist/:movieId` isteklerinin Movie API projemizde hangi katmanlardan geçeceğini belirledik. Ancak **kodu ilgili proje dosyalarına eklemek, işlemlerin doğru ve güvenli çalıştığını tek başına kanıtlamaz**. Ada kendi listesine film ekleyebilmeli; Deniz kendi hesabıyla Ada’nın kayıtlarını değiştirememeli. Bunun için 63. bölümde ele aldığımız yetki testi yaklaşımıyla HTTP yanıtlarını ve MongoDB’de oluşan değişiklikleri birlikte kontrol ederiz. Canlı ortamda, çerezle kimliği doğrulanan ve veri değiştiren isteklerde 65. bölümde açıkladığımız CSRF savunmasının da gerçekten uygulanması gerekir.

## Hesap Güvenliği Yaşam Döngüsü

User modelimiz artık yalnız isim/email/password değildir.

Önemli durum alanları:

```text
role
isEmailVerified
isActive
authVersion
avatarUrl
```

## Örnek 12

Bu alanların her birinin ayrı bir görevi var: Örneğin `authVersion`, yazılım sürümünü değil, **eski erişim JWT'lerini reddetmek için artırdığımız sayıyı** tutar. Bu nedenle hiçbirini genel profil güncelleme isteğinden (`PATCH /users/me`) gelişigüzel değiştiremeyiz.

Parola sıfırlama veya hesap devre dışı bırakma gibi bir güvenlik olayı yaşandığında:

```text
password reset
account disable
credential compromise
```

## Örnek 13

ilgili yenileme belirteçleri iptal edilir; önceden verilmiş erişim JWT'lerini reddetmek gerekiyorsa `authVersion` sayısı artırılır. Bu sayının etkili olması için JWT doğrulamasında güncel kullanıcı değeriyle karşılaştırılması gerektiğini unutmayın.

---

## Refresh Token Zinciri

```text
R1
↓ kullanıldı
R2
↓ kullanıldı
R3
```

## Örnek 14

Her token:

```text
raw değer → yalnız client
hash → DB
familyId → rotation zinciri
usedAt → tekrar kullanım sinyali
revokedAt → invalidation
expiresAt → zaman sınırı
```

## Örnek 15

Eski R1 yeniden görülürse:

```text
reuse detected
↓
family revoke
↓
audit event
↓
yeniden login
```

## Örnek 16

Örneğin Ada R1 ile R2'yi aldıktan sonra biri R1'i yeniden kullanırsa sunucu bunu şüpheli bir tekrar olarak değerlendirebilir. Aynı yenileme zincirindeki belirteçleri iptal edip yeniden giriş istemek, yalnız yeni JWT üretmekten daha geniş bir güvenlik sorumluluğudur. Bu davranışın eşzamanlı istekler ve ağ kopmaları karşısında da doğru çalıştığını ayrıca test etmeliyiz.

---

## Cookie Güvenliği

Canlı ortamda kullanılan web arayüzü için:

```text
HttpOnly
Secure
SameSite policy
mümkün olduğunca dar Path
HTTPS
```

## Örnek 17

kullanıyoruz.

Çerezler uygun isteklerde otomatik gönderildiği için **CSRF savunmasını da eklememiz gerekir**. 65. bölüm bu savunmanın mantığını ve örnek yardımcı kodunu gösterir; gerçek bir koruma elde etmek için denetimi veri değiştiren Router’lara bağlamak ve test etmek gerekir:

```text
SameSite
+
CSRF token
+
CORS allowlist
+
Origin politikası
```

## Örnek 18

`HttpOnly` ile CSRF'i, `SameSite` ile XSS'i çözmüş saymıyoruz.

Her savunmanın hedefi farklıdır.

---

## Profil Fotoğrafının Yüklenme Süreci

```text
POST /users/me/avatar
↓
authenticate → yalnız giriş yapmış kullanıcı
↓
Multer → dosya geçici olarak req.file.buffer (RAM)
↓
src/services/files.js → sharp ile görüntüyü doğrula / WebP üret
↓
AVATAR_STORAGE=local → uploads/avatars/...webp (sunucu diski)
veya
AVATAR_STORAGE=cloudinary → src/services/cloudinary.js → Cloudinary
↓
MongoDB User.avatarUrl → yerel yol veya Cloudinary HTTPS adresi
↓
Yerel yol → Express sunar / Cloudinary adresi → Cloudinary sunar
```

## Örnek 19

temini 58. bölümde uyguladık. **Yerel disk** proje makinesine bağlıdır; **Cloudinary** ise fotoğrafı uygulama sunucusundan ayrı tutar. Hangi yöntemi kullanacağımızı `.env` içindeki `AVATAR_STORAGE` seçer; Controller ve `POST /users/me/avatar` yolu değişmez. `avatarUrl` dosyanın kendisi değil, erişim adresidir. Bulut hizmetinin kullanılması, fotoğraf erişim izinlerini ve eski dosyaları silme işini kendiliğinden çözmez.

---

**Ada'nın fotoğrafını son kez izleyelim:** İstek `POST /users/me/avatar` yoluna gelir. Multer dosyayı RAM'de alır, Sharp dosyayı işler, `AVATAR_STORAGE` ayarıyla fotoğraf ya yerel diske ya Cloudinary'ye kaydedilir. MongoDB'deki `User.avatarUrl` alanına yalnızca erişim adresi yazılır. Ada fotoğrafını yeniden açtığında tarayıcı bu adresi kullanır; **MongoDB resmin kendisini saklamaz**.

İzleme listesinde de aynı denetimi yapalım: Veritabanında doğru modelin bulunması yeterli değildir; istek Router'dan geçip Service'e ulaşmalı, yetki denetimi yapılmalı ve sonucu tekrar okuyabilmeliyiz. Bu nedenle final kontrolleri tamamlanmış kodla, kısmi örneği ve tasarım seçeneğini birbirinden ayırır.

## Test Matrisi

Final projede en az şu davranışlar otomatik test edilmelidir:

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
[ ] support talebi doğrulanmış kullanıcıdan kabul edilir
[ ] support e-posta alıcısı kullanıcı tarafından değiştirilemez
[ ] support mesajı hatalıysa 400, rate-limit aşıldıysa 429
[ ] support SMTP hatasında başarılı yanıt dönmez
[ ] support: dosyasız istek eskisi gibi çalışır; geçerli tek ek destek e-postasına gider
[ ] support: zararlı, sahte tür, büyük dosya ve kapalı ClamAV ekli isteği durdurur
[ ] support için CSRF koruması canlı Router'da etkin
[ ] upload size/type limitleri çalışır
[ ] CSRF token olmadan state-changing cookie request reddedilir
```

## Örnek 20

Bu liste yalnızca bir plan değil, **doğrulanacak davranışların listesi**. Her madde için gerçek HTTP isteği, test çıktısı veya veritabanı sorgusu gibi bir kanıt aramalıyız. Örneğin fotoğraf yükleme başarılıysa yalnız `200` yanıtına bakmayıp `avatarUrl` ile görseli yeniden açmalıyız. Başarısız yetki isteğinde ise ilgili kaydın değişmediğini göstermeliyiz.

## Canlıya Geçmeden Yanıtlamamız Gereken Sorular

Sistemi canlıya çıkarmadan önce şu sorulara açık cevap verebilmeliyiz:

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

## Örnek 21

sabı devre dışı bırakılan Ada'nın eski JWT'si çalışmamalı, bir ağ kesintisi aynı yorumun iki kez yazılmasına yol açmamalıdır. **Canlıya hazır olma kararı, hem olumlu hem olumsuz senaryoların testine dayanır.**

## Film Kataloğundan Güvenli Kullanıcı Sistemine

Bu kitabın başında Ada, Movie API'nin film kataloğunda gördüğü *Interstellar*'ı kendi izleme listesine kaydetmek istiyordu. Filmi herkesin görebilmesi yeterli değildi; Ada'nın kişisel listesini Deniz'inkinden ayırmamız gerekiyordu. Kullanıcı hesabı, yorumlar ve profil fotoğrafı gibi ihtiyaçlar eklendikçe sorumuz daha da belirginleşti: **Bu işlem kime ait ve sunucu buna hangi koşullarda izin vermeli?**

Bu sorunun yanıtını tek bir kütüphanede aramadık. Parolayı güvenli saklamayı, giriş bilgilerini doğrulamayı, kısa ömürlü erişim belirteçlerini yenilemeyi, kaydın sahibini denetlemeyi ve veritabanında tutarlı sonuçlar üretmeyi birbirine bağladık. Deniz'in Ada'ya ait bir kaydı değiştirememesi, yanlış bir isteğin veriyi bozmaması ve yüklenen fotoğrafın saklandığı konumdan yeniden görüntülenebilmesi, **aynı sistemin farklı sorumlulukları** hâline geldi.

Movie API'nin güvenlik zinciri, birbiriyle bağlantılı şu denetimlerden oluşur:

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
