# Bölüm 69 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

u çalıştırmak değil, gerçek ortamın farklı davranışlarını da doğrulamaktır.**

Bu bölümde her güvenlik ayarını yeniden öğrenmek yerine, öğrendiklerimizi **nasıl kanıtlayacağımızı** ele alacağız.

## Testlerin Geçmesi Canlıya Çıkmak İçin Neden Yetmez?

Ada'nın bilgisayarında `localhost` ile giriş başarılı olabilir; canlıda ise tarayıcıdan gelen HTTPS isteği önce ters proxy'ye, sonra Node.js'e ulaşabilir. Yanlış `Secure`, `SameSite` veya `trust proxy` ayarı nedeniyle giriş çerezi hiç kaydedilmeyebilir.

Bir başka örnek: Yerelde `uploads/avatars/` içine yazılan fotoğraf, geçici diski sıfırlanan bir sunucuda dağıtımdan sonra kaybolabilir. **MongoDB'de `avatarUrl` bulunması, fotoğrafın saklandığı anlamına gelmez.** `AVATAR_STORAGE=cloudinary` seçersek dosya Cloudinary'de; `local` seçersek disk üzerinde tutulur. Bu seçimin gerçek barındırma ortamında kalıcı olup olmadığını sınamalıyız.

Canlıya çıkmadan önce üç sorumuz var: *Oturum güvenle korunuyor mu? Kullanıcı verisi kalıcı mı? Hata olduğunda durumu anlayıp toparlayabiliyor muyuz?* Sonraki kontroller bunlara somut yanıt arıyor.

## 1. Gizli Anahtarlar

Ada'nın hesabını koruyan gizli değerler kaynak kodun içine yazılmamalıdır. Örneğin:

```text
JWT_ACCESS_SECRET
SESSION_SECRET
CSRF_SECRET
SMTP_PASS
MongoDB credential
storage API key
```

## Örnek 2

Bu değerleri dağıtım ortamının gizli ayarlarında veya güvenilir bir gizli anahtar yönetim hizmetinde saklarız. Böylece kaynak kodu paylaşmak, parolaları ve imzalama anahtarlarını paylaşmak anlamına gelmez.

Bir gizli değer yanlışlıkla GitHub'a gönderildiyse yalnız `.env` dosyasını `.gitignore`a eklemek yeterli değildir. **Bu dosyayı artık izlememek, geçmişte paylaşılmış anahtarı gizlemez:** Önceki commit'lerdeki değer hâlâ görülebilir. Böyle bir durumda **eski değeri geçersiz kılıp yeni değer üretmek** gerekir. Çünkü dosyayı sonradan gizlemek, daha önce kopyalanmış anahtarları geri almaz.

---

## 2. HTTPS ve Çerez Güvenliği

Ada'nın tarayıcısına gerçek kullanıcı oturumu için gönderdiğimiz çerezlerde şu sınırları kontrol etmeliyiz:

```text
HttpOnly
Secure
uygun SameSite
mümkünse dar Path
```

## Örnek 3

`HttpOnly`, sayfadaki JavaScript'in çerez değerini doğrudan okumasını sınırlar; `Secure`, çerezin HTTPS üzerinde taşınmasına yardımcı olur; `SameSite` ve `Path` ise hangi isteklerde gönderileceğini etkiler. Bu ayarların görevlerini ayrı bölümlerde gördük. Canlıya çıkarken **gerçek alan adı ve HTTPS bağlantısıyla çalıştıklarını** doğrulamalıyız.

Yalnız giriş sayfasının HTTPS olması yetmez; giriş yapıldıktan sonraki bütün korumalı isteklerde bağlantı güvenli olmalıdır. Önünde ters proxy varsa Express'in `trust proxy` ayarını altyapıya göre doğru yapılandırıp test etmemiz gerekir.

---

## 3. CORS

Çerezli giriş kullanan tarayıcı uygulamasında:

CORS ayarı, Express uygulamasını oluşturduğumuz `src/server.js` dosyasındaki mevcut middleware sırasına aittir. Aşağıdaki seçenekler dağıtım adresinize göre düzenlenecek bir örnektir; yeni bir Router dosyası açılmaz.

```js
cors({
  origin: env.frontendOrigin,
  credentials: true,
});
```

## Örnek 4

gibi, izin verilen arayüz adresini açıkça belirten bir ayar kullanabiliriz. Herhangi bir sitenin kimlik bilgileriyle istekte bulunmasına izin vermek yerine yalnız gerçekten kullandığımız adresleri kabul ederiz. Ancak CORS, kullanıcının yönetici olup olmadığına karar vermez; sunucudaki token, rol ve sahiplik kontrolleri aynı şekilde çalışmalıdır.

Ada'nın film arayüzü `https://app.example.com`, API ise `https://api.example.com` adresinde çalışıyorsa tarayıcı bunları **farklı origin** olarak görür. *Origin*, adresin protokolü, alan adı ve portuyla belirlenir. Bu iki adres farklı origin olmasına rağmen aynı site kapsamında olabilir; **origin ile site aynı kavram değildir.**

Tarayıcı kodu böyle bir API'ye çerezli istek gönderecekse, kullandığımız araca göre bunu açıkça belirtiriz:

```js
fetch("https://api.example.com/users/me/movies", {
  credentials: "include",
});
```

## Örnek 5

Axios ile aynı tercih:

```js
axios.get("https://api.example.com/users/me/movies", {
  withCredentials: true,
});
```

## Örnek 6

Burada 43. bölümde oluşturduğumuz kişisel film listesi yolunu kullanıyoruz: `GET /users/me/movies`. Ada kendi listesini açmak isterken bu istek kimlik bilgisi gerektirir. **Peki neden bu seçeneği yazdık?** Tarayıcı, farklı origin'e yapılan isteklerde kimlik bilgilerini varsayılan olarak göndermeyebilir. `credentials: "include"` veya `withCredentials: true` bu yöndeki istemci tercihini belirtir. Ancak çerezin alan adı, `SameSite` ve `Secure` kuralları yine geçerlidir; bu seçenekler onları aşmaz.

Sunucu da izin verdiği arayüz origin'ini `Access-Control-Allow-Origin` başlığında açıkça belirtmeli ve çerezli çapraz-origin isteklerine izin veriyorsa `Access-Control-Allow-Credentials: true` döndürmelidir. **Kimlik bilgileriyle birlikte `Access-Control-Allow-Origin: *` kullanılamaz.** İzin verilmiş bir origin, kullanıcının yetkili olduğu anlamına gelmez; sahiplik ve rol denetimleri çalışmaya devam eder.

---

## 4. CSRF

Çerezle kimlik doğrulanan ve veriyi değiştiren isteklerde:

```text
SameSite
CSRF token
Origin politikası
sıkı CORS
```

## Örnek 7

önlemlerinin uygulamamızın gerçek adreslerinde nasıl birlikte çalıştığını denemeliyiz. Film arayüzünü başka bir alan adına taşırsak çerezlerin gönderilme biçimi değişebilir; dolayısıyla önceki CSRF testi yeni ortamı otomatik olarak doğrulamış olmaz.

---

## 5. İstek Hızı Sınırları

Özellikle:

```text
/auth/login
/auth/register
/auth/forgot-password
/auth/resend-verification
/auth/refresh
```

## Örnek 8

yollarında art arda otomatik istek göndermek hesabı ele geçirmeye veya çok sayıda e-posta üretmeye çalışan kişilerin işini kolaylaştırabilir. Bu nedenle istek hızını sınırlarız. Ancak kayıt ve giriş isteğiyle normal film listeleme isteğine aynı sınırı uygulamak her zaman uygun değildir. IP adresi, hesap ve davranış türüne göre farklı sınırlar gerekebilir; gerçek kullanıcıların yanlışlıkla engellenmemesi de test edilmelidir.

---

## 6. Parola Hash Ayarları

Parola hash işleminin `memoryCost`, `timeCost` ve `parallelism` ayarları hesaplamanın ne kadar bellek ve işlem süresi harcayacağını belirler. Ada tek başına giriş yaparken hızlı çalışan ayarlar, birçok kullanıcı aynı anda giriş yaptığında sunucuyu zorlayabilir. Bu nedenle üretim ortamında **güvenliği azaltmadan süre ve kaynak kullanımını ölçeriz**. Amaç en hızlı ayarı bulmak değil; parola tahminine dirençle kabul edilebilir sunucu yükü arasında bilinçli bir denge kurmaktır.

## 7. Belirteçlerin ve Oturumların Yaşam Döngüsü

Kontrol edin:

```text
access token kısa ömürlü
refresh token süreli
rotation çalışıyor
reuse detection family revoke ediyor
logout refresh'i revoke ediyor
password reset authVersion artırıyor
inactive User authentication'dan geçmiyor
```

## Örnek 9

Oturum (session) yöntemi kullanılıyorsa şu üç davranışı ayrıca kontrol edelim:

- Oturum kayıtları varsayılan `MemoryStore` ile yalnızca Node.js belleğinde değil, 19. bölümde kurduğumuz **MongoDB tabanlı saklama mekanizmasında** tutuluyor mu?
- Başarılı girişten sonra oturum kimliği `regenerate()` ile yenileniyor mu?
- Çıkış yapıldığında sunucu ilgili oturum kaydını gerçekten siliyor mu? Çerezi tarayıcıdan kaldırmak tek başına yeterli değildir.

Bunun yanında oturumun ne zaman sona ereceğine de karar vermeliyiz. **Hareketsizlik sınırı**, Ada belirli süre hiçbir işlem yapmadığında oturumu kapatır; **azami oturum ömrü** ise Ada sürekli işlem yapsa da belirlenen sürenin sonunda yeniden giriş ister. Birincisi unutulmuş oturumlara, ikincisi gereğinden uzun açık kalan oturumlara karşıdır. Bunlar kendiliğinden etkinleşmez: oturum kayıtlarını saklayan bileşenin ve oturum ara yazılımının ayarlarıyla ayrıca uygulanıp test edilmelidir.

---

## 8. Veritabanı İndeksleri

Production'da gerçekten var mı?

```text
users.email unique
refreshTokens.tokenHash unique
watchlistItems userId+movieId unique
reviews userId+movieId unique
owner/userId query index'leri
```

## Örnek 10

Bu indeksleri yalnız Mongoose şemasında tanımlamak yetmez. Gerçek MongoDB veritabanında oluşup oluşmadıklarını da kontrol ederiz. Örneğin izleme listesi için benzersiz indeks eksikse Ada aynı filmi birden fazla kez kaydedebilir; testte çalışan kod üretimde farklı davranabilir.

---

## 9. Hata Yanıtları

Production Response:

```text
stack trace
MongoDB connection string
JWT secret detail
SMTP error credential
filesystem path
```

## Örnek 11

gibi ayrıntılar dışarıdaki kullanıcıya gösterilmemelidir. Ada'nın göreceği hata mesajı anlaşılır olabilir; geliştiricinin tanı koymasını sağlayan teknik ayrıntılar ise güvenli sunucu kayıtlarında kalmalıdır. Hata yanıtının işe yarar olması için veritabanı bağlantı adresini veya gizli anahtarı açığa çıkarmamız gerekmez.

---

## 10. Günlükler ve Denetim Kayıtları

Güvenlik olaylarını anlayabilmek için günlük tutuyoruz; fakat ham parola, oturum çerezi veya yenileme belirteci bu kayıtlara yazılmamalıdır. Örneğin şu durumların sayısını ve zaman içindeki değişimini izlemek yararlıdır:

```text
login failure rate
refresh reuse
5xx artışı
SMTP failure
session/token store failure
DB latency
rate-limit hit
```

## Örnek 12

Uyarı eşiklerini uygulamanın normal trafiğine göre ayarlarız. Günde on girişin olduğu uygulamayla dakikada binlerce isteğin geldiği uygulamada aynı eşik aynı anlama gelmez.

---

## 11. E-posta ve Hesap Kurtarma

Verification/reset linkleri:

```text
HTTPS frontend URL
süreli
tek kullanımlık
raw token DB'de yok
```

## Örnek 13

ama isteğinin dışarıya verdiği yanıt da bir e-posta adresiyle hesap bulunup bulunmadığını açığa çıkarmamalıdır.

50. bölümdeki `POST /support/requests` yolunu canlıya alırken `SUPPORT_EMAIL_TO` adresinin gerçekten teslim alabildiğini, `EMAIL_FROM` gönderen kimliğinin SMTP hizmetinde doğrulandığını ve e-posta yanıtlarının `replyTo` üzerinden doğru adrese yönlendiğini sınayın. Destek talebinin gereksiz yere yinelenmemesi için istek sınırını, CSRF savunmasını ve gönderim hatasında kullanıcıya dönen yanıtı test edin. Destek bildiriminde parola, erişim belirteci veya çerez değeri istemeyin; loglara da yazmayın.

---

## 12. Dosya Yükleme

58. bölümdeki `AVATAR_STORAGE` seçimini canlı sunucu için açıkça belirleyin. `local` kullanıyorsanız `uploads/avatars/` klasörünün yeniden dağıtımda silinmeyeceğini, yedek alındığını ve gerekirse bütün sunucu kopyalarının erişebildiğini doğrulayın. `cloudinary` kullanıyorsanız Cloudinary hesabının gerçek anahtarlarını **yalnız sunucu ortam değişkenlerinde** tutun; yükleme hatalarını, hesap kotasını ve eski avatarların temizlenmesini ayrıca takip edin. İki yöntemde de `User.avatarUrl` yalnızca adrestir; fotoğrafın saklandığı yer değildir.

Kontrol edin:

```text
file size limit
file count limit
type allowlist
gerçek içerik doğrulama stratejisi
server-generated object key
private/public storage permission
orphan cleanup
```

## Örnek 14

 tasarımın parçasıdır.

---

Eski avatarı silme ve kullanılmayan dosyaları temizleme otomasyonu **bu örnekte tamamlanmadı**. Dolayısıyla yeni fotoğraf yüklenince depolama alanında önceki fotoğrafın kalması mümkündür. Boyut sınırına ek olarak istek yoğunluğunu ve bellek kullanımını izlemeliyiz. Herkese açık avatar dosyalarıyla özel belgeleri aynı yayınlama klasöründe tutmamalıyız.

## 13. Test ve Yedekleme

Gerçek kullanıcılar gelmeden önce kritik kayıt, giriş, çıkış ve yetki yollarını otomatik entegrasyon testleriyle kontrol etmeliyiz. Testlerin kullandığı veritabanı, Ada'nın gerçek hesabının tutulduğu veritabanı olmamalıdır. Yedekleme için de yalnız “yedek açık” yazmasına güvenmeyiz; bir kopyadan geri yükleme işlemini denemek, ihtiyaç anında veriye gerçekten ulaşabileceğimizi gösterir. Kimlik veritabanının kaybı yalnız kayıtların değil, kullanıcıların hesaplarına erişiminin de kaybı demektir.

---

## 14. Bağımlılıklar ve Node.js Sürümü

Uygulamayı kullandığımız Node.js sürümünün desteklenen bir sürüm olması önemlidir; geliştirme bilgisayarımızdakiyle canlı sunucudaki sürümler arasındaki fark beklenmedik davranışlara yol açabilir. Yüklediğimiz bağımlılıkların güvenlik durumu için:

```bash
npm audit
```

## Örnek 15

Ancak çıkan her uyarıya düşünmeden `--force` uygulamak, çalışan kodu uyumsuz bir paket sürümüne taşıyabilir. Güncellemenin neyi değiştirdiğini, gerçekten etkilenip etkilenmediğimizi ve test sonuçlarını birlikte değerlendirmeliyiz. Sürüm kilit dosyasını (`package-lock.json`) dağıtımda kullanmak da farklı makinelerde aynı bağımlılık sürümlerini kurmamızı kolaylaştırır.

---

Bu kontrolleri birbiriyle ilişkilendirmek önemlidir. Örneğin Ada canlı sitede giriş yapabiliyor fakat sayfayı yenileyince oturumu kayboluyorsa yalnız `POST /auth/login` koduna bakmak yeterli olmayabilir. HTTPS, çerezin `Secure` ve `SameSite` ayarları, arayüzün istekte çerez göndermesi, proxy’nin gerçek bağlantıyı doğru tanıması ve CORS izinleri aynı kullanıcı deneyimini etkiler. **Başarılı test**, bu zincirin gerçek alan adlarıyla da çalışmasıdır; yalnız sunucunun bir kez `200` döndürmesi değil.

**İzleme listesi HTTP kontrolü:** 54. bölümdeki üç yolun Router’a bağlandığını ve 63. bölümde iki farklı hesapla veri ayrımının sınandığını doğrulayın. Çerezli POST ve DELETE isteklerine uygun CSRF savunması eklenmeden yalnızca Router’ın bulunması canlıya hazır olunduğunu göstermez.

## Canlı Ortama Geçiş Kontrol Listesi

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
[ ] support: alıcı, alındı e-postası, 401/403/400/429 ve SMTP hatası sınandı
[ ] support: CSRF savunması ve ortak rate-limit deposu canlı ortamda doğrulandı
[ ] support eki: tür/boyut/tek dosya sınırı, ClamAV erişimi ve 413/415/422/503 hataları test edildi
[ ] support eki: tarama yoksa dosya gönderilmez; e-posta eki yalnız destek adresine gider
[ ] upload limitleri aktif
[ ] test DB ayrı
[ ] backup/restore planı var
[ ] monitoring/alerts hazır
```
