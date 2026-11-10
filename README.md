# Node.js ile Backend Geliştirme: Kullanıcı Yönetimi ve Güvenli API'ler

## 2. Kitap — Movie API kodları

Resmî depo: https://github.com/yasinbesni/Movie-API-Node.js-Backend-Book-2

Bu paket kitapla birlikte kullanılır. 01–70 numaralı bölüm klasörleri öğrenme sırasını korur. Çoğu `code/` klasörü yalnız ilgili bölümde değişen dosyaları içerir; bunlar ayrı uygulamalar değildir. Kodları tek bir çalışma kopyasında birleştirin. `kod_ornekleri.md` içindeki tasarım karşılaştırmaları, HTTP örnekleri ve fonksiyon parçaları da bağımsız çalıştırılacak dosyalar değildir.

## Tam projeyi çalıştırma

70. bölümün `code/movie-api/` klasörü birleştirilmiş final uygulamasıdır. Terminali burada açın. Node.js 22.12 veya üzeri gerekir; doğrulama Node.js 24 ile yapıldı.

```bash
npm ci --ignore-scripts
cp example.env .env
```

PowerShell kullanıyorsanız kopyalama komutu `Copy-Item example.env .env` olur. `.env` içindeki MongoDB adresini kendi deneme veritabanınızla değiştirin. Gizli değer içeren ayarlarda her değişken için ayrı bir değer üretin:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
npm start
```

`example.env` istenen ana örnek dosyadır. `.env.example` aynı içeriğin önceki kullanım biçimiyle uyumlu kopyasıdır. İkisini birden yüklemeyin; yalnız birini `.env` adıyla kopyalayın. Örnek dosyalar gerçek şifre içermez. Bir bölümde yalnız değişen dosyalar varsa o bölümün `example.env` dosyasını çalışma projenizin `package.json` dosyasının yanında kullanın.

## Kontrol

Depo kökünde `node tools/dogrula.mjs`, bölüm sayısını, JavaScript sözdizimini, tam projelerin importlarını ve örnek ortam ayarlarını denetler. Final proje klasöründe `npm test`, otomatik olarak ayrı ve geçici MongoDB replica set oluşturur; sizin MongoDB adresinizi kullanmaz. İlk testte MongoDB test ikilisi indirilir; internet erişimi gerekir. Bu test bağımlılıklarını canlı ortama yüklemek için kullanmayın; canlı kurulumda `npm ci --ignore-scripts --omit=dev` kullanılır.

Test kapsamı ve dış hizmet sınırları için `UYUMLULUK_RAPORU.md` dosyasına bakın.

## Başlangıç ve kontrol sürümleri

`00_Baslangic_Movie_API/code/movie-api/`, **Node.js ile Backend Geliştirme: Temelden Gerçek Bir API’ye (1. Kitap)** finaliyle aynı başlangıç kodudur. Kullanıcı özellikleri bu başlangıçta hazır değildir.

`00_Kontrol_Noktalari/` içindeki 13, 22, 35 ve 43 sürümleri yalnız o aşamaya kadar işlenen konuları içerir. Sonraki bölümlerin güvenlik özellikleri için 70. bölüm finalini kullanın. Her tam projenin kendi `package.json`, `package-lock.json` ve `example.env` dosyası vardır.

Final uygulamada önce `GET /auth/csrf` çağrısıyla çerez ve `csrfToken` alın. Veri değiştiren isteklerde aynı istemcinin çerezleriyle birlikte `X-CSRF-Token` başlığı gönderilir. Tarayıcıda `credentials: "include"` kullanın. Oturum girişi `/auth/login`, JWT girişi `/auth/jwt/login` yolundadır.

Finalde parola sıfırlama, e-posta değişikliği, hesap kapatma ve refresh rotation transaction kullanır. MongoDB Atlas veya replica set gerekir. SMTP için yerel bir test posta kutusu kullanılabilir. Destek dosya eki ClamAV taraması olmadan gönderilmez; dosyasız destek isteği tarayıcı hizmetine ihtiyaç duymaz. Cloudinary yalnız `AVATAR_STORAGE=cloudinary` seçildiğinde gerekir. Yerel avatar saklama varsayılandır.

SMTP adresi ve kimlik bilgileri, Cloudinary bilgileri, frontend HTTPS adresi ve varsa reverse proxy sayısı kendi ortamınızla doğrulanmalıdır. `TRUST_PROXY=1` yalnız API’nin doğrudan önünde bir güvenilir proxy olduğunda seçilir.
