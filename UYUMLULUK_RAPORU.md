# Movie API — İki Kitap İçin Kod Uyumluluk Raporu

Tarih: 11 Kasım 2026. Doğrulama ortamı: Node.js 24.22.1, Linux, Express 5, Mongoose 9, geçici MongoDB 7.0.14 replica set.

## Kaynaklar

Kullanıcının gönderdiği iki Movie API ZIP arşivi güncellendi. Kitap karşılaştırmasında `NodeJS-Backend-1-Kitap-Guncel-Kapaklar-Profil-Bos.zip` ve `NodeJS-Backend-2-Kitap-On-Soz-Icindekiler-SVG-Duzeltilmis.zip` içindeki 70'er bölüm kullanıldı. Kitap metinleri değiştirilmedi. İncelenen bölüm dosyalarının SHA-256 değerleri her kod paketindeki `KITAP_KAYNAK_ESLESME.json` dosyasında bulunur.

## Düzenlemeler

- Her iki kitapta 01–70 bölüm sırası korundu. Güncel kitaplardaki kod, HTTP ve tasarım blokları bölüm bazında `kod_ornekleri.md` dosyalarına açıklama bağlamlarıyla alındı. Bu dosyalar çalışan proje yerine geçmez; karşılaştırma örnekleri de içerir.
- Ortam gerektiren bölüm çalışma klasörlerine `example.env` eklendi. Birinci pakette 42, ikinci pakette 71 dosya vardır; başlangıç/final ve kontrol kopyaları bu sayıya dahildir. Önceki kullanımla uyum için `.env.example` aynı içerikle tutuldu. Gerçek sır ve `.env` dosyası paketlenmedi.
- README metinleri, kitap adları, resmî GitHub adresleri ve çalıştırma talimatları düzeltildi. PowerShell ve Bash kopyalama komutları açıklandı.
- Bağımlılıklar kurulan sürümlere sabitlendi; 15 `package.json` için `package-lock.json` üretildi. Node.js alt sınırı belirtildi.
- Yanlışlıkla login route zincirine bağlanmış logout/JWT/refresh işleyicileri ayrıldı. Session ve cookie middleware sırası, çerezli CORS ayarı ve kontrollü proxy seçimi düzeltildi.
- İkinci kitapta kodlaması bozulmuş yinelenen 64. bölüm klasörü kaldırıldı; doğru ASCII adlı bölüm korundu.
- Güncel e-posta, destek, yükleme ve dosya eki tarama bileşenleri bölüm kaynaklarına eklendi.
- İkinci kitabın 70. bölümüne eksik olan birleştirilmiş `code/movie-api/` finali eklendi. Model, Service, Controller ve Router bağlantıları tamamlandı; JWT/session girişleri, hesap yaşam döngüsü, sahiplik, watchlist, review, avatar ve destek yolları bağlandı.
- Finalde tüm mutasyonlara CSRF denetimi bağlandı. `GET /auth/csrf` ile alınan token ve aynı istemcinin çerezleri birlikte kullanılır.
- Refresh rotation transaction içinde atomik tüketim ve yeni kayıt üretimi yapar. Tekrar kullanım tespitinde aile iptali commit edilir. Kullanıcı etkinliği ve authVersion kontrolleri eski yetkileri reddeder.
- E-posta değişikliği tamamlandığında eski hesap belirteçleri ve refresh kayıtları iptal edilir. Böylece önceki posta kutusuna gönderilmiş kurtarma bağlantıları geçersiz kalır.
- Bilinen HTTP hata durumları, bozuk JSON, geçersiz kimlik ve dış hizmetin kullanılamaması için yanıtlar düzenlendi. Loglarda çerez ve belirteç alanları maskelendi; bazı güvenlik olayları AuditEvent kayıtlarına bağlandı.
- Birinci kitabın finali ile ikinci kitabın başlangıç kopyası dosya içerikleri bakımından eşitlendi.

## Doğrulama ve kanıt

| Kontrol | Sonuç |
|---|---|
| Birinci kitap final testleri | Temiz kurulumdan sonra 5 test geçti |
| İkinci kitap final testleri | Temiz kurulumdan sonra 22 test geçti |
| İkinci kitap 13, 22, 35, 43 kontrol noktaları | MongoDB ve HTTP başlangıç/giriş kontrolleri geçti |
| Birinci kitap finali bağımsız kontrolü | CRUD ve tekil indeks kontrolü geçti |
| Bölüm sırası | Her pakette 70 bölüm |
| JavaScript sözdizimi ve tam proje importları | Statik doğrulayıcıyla kontrol edildi |
| Tam projelerin env kapsamı | Kullanılan doğrudan ayarlar örnek dosyalarda kontrol edildi |
| Bağımlılık taraması | Doğrulama ortamındaki kurulu bağımlılıklarda npm audit 0 bulgu bildirdi |

Otomatik testler kayıt, hatalı kayıt, e-posta tekrarı, parola gizliliği, genel giriş hatası, anonim erişim, admin yetkisi, e-posta doğrulaması, film sahipliği, kişisel liste, eşzamanlı watchlist, review tekilliği ve ortalaması, profil alanları, avatar, destek mesajı/eki, zararlı veya sahte dosya, tarama hizmeti eksikliği, SMTP hatası, rate limit, e-posta değişikliği, süresi dolmuş token, refresh tekrar kullanımı, parola sıfırlama, hesap kapatma ve logout davranışlarını içerir. Bazı testler birden fazla HTTP ve MongoDB koşulunu birlikte sınar.

Kayıtlı test çıktıları `dogrulama/` klasöründedir. Statik denetim için depo kökünde `node tools/dogrula.mjs`; final projenin içinde otomatik test için `npm ci` ve `npm test` çalıştırılır.

## Kapsamın sınırları

Bu teslim iki kod paketidir; GitHub depolarına gönderim yapılmadı. Kitapların kapakları ve metin arşivleri güncellenmedi.

Bölüm klasörleri özgün öğretim yaklaşımıyla kısmi değişiklikler içerir. Her bölüm ayrı sunucu değildir. Tam uygulamalar başlangıç, kontrol noktaları ve 70. bölüm final klasörlerindedir. Kısmi kodların kendi başına başlatılabileceği ileri sürülmez.

SMTP ve ClamAV testlerinde yerel protokol test sunucuları kullanıldı; gerçek SMTP sağlayıcısına teslim ve gerçek antivirüs motorunun algılama kalitesi sınanmadı. Cloudinary'nin gerçek hesap bilgileriyle yükleme, gerçek reverse proxy/HTTPS dağıtımı ve Windows üzerinde uygulamalı çalıştırma yapılmadı. Bu hizmetler kullanıcının ortam bilgileriyle ayrıca doğrulanmalıdır.

Yerel avatar güncellemesi eski dosyayı otomatik silmez. Bu, raporda belirtilmiş bir saklama politikası sınırıdır; disk/bulut temizliği ve yedekleme politikası ayrıca uygulanmalıdır. Transaction kullanan final işlemleri Atlas veya replica set gerektirir.

Temiz kurulum `npm ci --ignore-scripts` ile yapıldı; bağımlılıkların kurulum betikleri çalıştırılmadı.

27 otomatik testin geçmesi, bütün olası girişleri veya canlı ortam koşullarını eksiksiz kanıtlamaz. Bu rapor yalnız burada gerçekten çalıştırılan kontrolleri ve sonuçlarını belirtir.

## Teknik başvuru

- Express 5 async hata iletimi: https://expressjs.com/en/5x/guide/error-handling/
- Mongoose transaction API: https://mongoosejs.com/docs/api/connection.html
- MongoDB transaction rehberi: https://www.mongodb.com/docs/drivers/node/v6.x/crud/transactions/
