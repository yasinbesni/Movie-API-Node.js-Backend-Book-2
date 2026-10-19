# Kontrol noktası — 35. bölüm sonrası Session + JWT

**İki oturum yaklaşımı aynı projede birlikte korunur.** `POST /auth/login` session yöntemiyle çalışır, `POST /auth/jwt/login` ise JWT erişim belirteci ve yenileme belirteci verir. `POST /auth/refresh` yenileme sürecini, `GET /users/me` erişim doğrulamasını gösterir.

Bu kodda refresh rotation temel MongoDB atomik işlemiyle anlatılmıştır. Yenileme belirteci aileleri için eşzamanlılık, transaction, güvenlik olayı kaydı, bütün çerezlerin silinmesi ve üretim izleme politikaları **ayrıca değerlendirilmelidir**. Bu kontrol noktası üretime hazır final kimlik sistemi diye sunulmaz.

Kullanılan yeni `cookie-parser` ve `jsonwebtoken` paketleri `package.json` içinde mevcuttur; test ortamında `npm install` sonrası çalıştırılabilir. Gerçek HTTP/MongoDB entegrasyon testi bu çalışmada yapılmamıştır.
