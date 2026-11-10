# 2. Kitap — Birleştirilmiş Movie API

Bu klasör 01–70 bölümlerindeki parçaları aynı Express uygulamasında birleştirir. Kitaptaki bazı şemalara ve tasarım örneklerine çalıştırma için gereken import, export, Controller ve Router bağlantıları eklenmiştir. Kısmi bölüm örnekleri öğrenme sırasını korur.

`npm ci --ignore-scripts` → `cp example.env .env` → sırları ve hizmet adreslerini düzenleyin → `npm start`. PowerShell: `Copy-Item example.env .env`. Test: `npm test`.

Önce `GET /auth/csrf` ile `csrfToken` alın; tüm POST/PATCH/DELETE isteklerinde çerezleri ve `X-CSRF-Token` başlığını birlikte gönderin. Postman’de cookie jar açık olmalıdır. `GET /movies` ortak katalogdur; `GET /users/me/movies` yalnız giriş yapan kişinin oluşturduğu filmleri gösterir. Filmleri değiştirme ve silme sorgusunda owner filtrelenir.

`DELETE /users/me` hesabı devre dışı bırakır; diğer kayıtları otomatik silmez. Parola sıfırlama, e-posta değişikliği ve hesap kapatma eski yetkileri `authVersion` ve refresh iptaliyle geçersiz kılar.

SMTP ve ClamAV yerel test çiftleriyle sınanır. Gerçek sağlayıcıya teslim, gerçek antivirüs motoru ve Cloudinary hesabına yükleme otomatik yerel testlerin kapsamı dışındadır. Yerel avatar güncellemesinde eski dosyalar otomatik silinmez; disk temizliği politikanızı ayrıca belirleyin.
