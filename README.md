# Backend Book 2 — Movie API Kodları

**Bu kitabın kod deposu:** [Backend Book 2 – Movie API](https://github.com/yasinbesni/Backend-Book-2-Movie-API)

İkinci kitabın kodlarını **tek bir Movie API'yi geliştirerek** takip ediyoruz. Başlangıç sürümü, *Node.js ile Backend: Sıfırdan Gerçek Bir API Geliştirme Rehberi* kitabının 70. bölümündeki final projedir.

**Birinci kitabın 70 bölüm klasörü bu depoya taşınmadı.** Yalnızca kitabın sonunda ortaya çıkan Movie API'nin bir kopyası `00_Baslangic_Movie_API/code/movie-api/` klasöründe bulunuyor. İkinci kitabın 1–70. bölüm klasörleri, bu uygulamada adım adım yaptığımız değişiklikleri gösteriyor.

## Nereden başlayacağım?

`00_Baslangic_Movie_API/code/movie-api/` klasörünü bilgisayarınızda bir **çalışma kopyası** olarak açın. Terminali `package.json` dosyasının yanında çalıştırıp başlangıç paketlerini `npm install` ile kurun. `.env.example` dosyasındaki ayarlarla ayrı bir deneme veritabanına bağlanın.

Bölümleri sırasıyla okuyun ve yaptığınız değişiklikleri **hep aynı çalışma kopyasına** uygulayın. Örneğin 5. bölümde `User` modelini, 6. bölümde kayıt doğrulamasını ekleyeceğiz. Bu dosyalar başlangıç projesinde hazır değil.

**Ortam değişkenleri:** Deponun kökündeki `.env.example` genel bir başvuru şablonudur. Çalıştıracağınız `movie-api/` klasörünün içindeki `.env.example` dosyasını aynı klasörde `.env` adıyla kopyalayıp kendi test veritabanı bilgilerinizi yazın. İlerleyen bölümlerde `SESSION_SECRET` ve `JWT_ACCESS_SECRET` eklenir; bunları ilgili aşamaya gelmeden zorunlu kabul etmeyin. `.env` dosyanızı Git deposuna göndermeyin.

## Klasörleri nasıl okuyacağım?

Her numaralı klasördeki `README.md` ilgili adıma kısa bir giriş sunar; `kod_ornekleri.md` kitaptaki kod ve HTTP örneklerini sırayla içerir. `code/` klasörü varsa yalnızca o aşamada ele alınan **tam dosya örnekleri** vardır. Bazı değişiklikler mevcut dosyaya eklenecek kod parçalarıdır; bunları tek başlarına yeni uygulama gibi çalıştırmayın.

`00_Kontrol_Noktalari/` klasöründe 13, 22, 35 ve 43. bölümlere ait birleştirilmiş karşılaştırma sürümleri bulunur. Bunlar ilerlemenizi kontrol etmek içindir, **tüm 70 bölümün test edilmiş final uygulaması** değildir. Başlangıç kaynağı: https://github.com/yasinbesni/Backend-Book-Movie-API

Uygulamanızı ayrı bir test veritabanında çalıştırın ve her bölümde eklediğiniz davranışı deneyin. `node tools/dogrula.mjs` komutu dosya eşleşmelerini ve sözdizimini kontrol eder; HTTP isteklerini veya MongoDB ile bütünleşik çalışmayı tek başına test etmez.
