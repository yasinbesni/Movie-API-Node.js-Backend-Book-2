# 35. Bölüm — Authentication Middleware (Kimlik Doğrulama Ara Katmanı) Kullanıcıyı İsteğe Nasıl Ekler?

**Kitaptaki bölüm:** `05_Authentication_Authorization/35_Authentication_Middleware_Kullaniciyi_Requeste_Nasil_Ekler.md`

Kitaptaki 35. bölümü okuyup değişiklikleri kendi Movie API çalışma kopyanıza uygulayın. Kod ve HTTP örneklerini `kod_ornekleri.md` dosyasından karşılaştırabilirsiniz.

Bu bölümdeki tam dosya örnekleri:

- `code/src/middlewares/authenticate.js`
- `code/src/controllers/users.js`
- `code/src/routers/users.js`

Bu klasör, **aynı projede yaptığımız 35. adımı** gösterir. Uygulamanın bütünü veya baştan kurulacak farklı bir proje değildir. Başlangıç kopyasının nasıl hazırlanacağı kod deposunun ana README dosyasında anlatılıyor.

## Ortam ayarları

`code/example.env` bu bölümün çalışma kopyası için örnektir. Dosyayı uygulamanızdaki `package.json` dosyasının yanına `.env` adıyla kopyalayın. Bu klasörde yalnız değişen dosyalar varsa onları mevcut projenize uygulayın; parçaları tek başına başlatmayın.
