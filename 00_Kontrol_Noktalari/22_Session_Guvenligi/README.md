# Kontrol noktası — 22. bölüm sonrası Session (Oturum)

Bu klasörde 13. bölümde oluşturulan kullanıcı kaydı ve login sistemi **korundu**. 17–22. bölümlerde eklenen `express-session`, MongoDB oturum deposu, çıkış ve başarılı giriş sonrası Session ID yenilemesi birleştirildi.

`package.json` bu kontrol noktasında gereken yeni bağımlılıkları içerir. Öncelikle `.env` içinde `MONGODB_URL` ve güçlü `SESSION_SECRET` yapılandırılmalıdır. `npm install`, ardından `npm start` ile ayrı test veritabanında denenebilir.

**Statik kontrol:** JavaScript sözdizimi ve iç import yolları kontrol edilecek. Canlı MongoDB ile HTTP uçtan uca test **henüz yapılmadı**. HTTPS, reverse proxy ve CSRF güvenliği üretim ortamında ayrıca yapılandırılmalıdır.
