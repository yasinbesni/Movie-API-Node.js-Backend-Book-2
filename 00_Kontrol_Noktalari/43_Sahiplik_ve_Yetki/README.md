# Kontrol noktası — 43. bölüm sonrası yetki ve sahiplik

35. bölümün Session/JWT uygulaması korunmuştur. 38. bölümde role kontrolü, 42. bölümde Movie sahibi, 43. bölümde kullanıcının kendi eklediği film kayıtları bu birleştirilmiş sürüme eklendi.

- `GET /movies` ve `GET /movies/:movieId` ortak film kataloğu olarak herkese açıktır.
- `POST /movies`, `PATCH /movies/:movieId` ve `DELETE /movies/:movieId` kimlik doğrulaması ister; değişiklik/silme Service sorguları `owner` filtresi uygular.
- `GET /users/me/movies` yalnız giriş yapan kullanıcının eklediği kayıtları listeler.
- `GET /admin/access-check` role tabanlı erişim kontrolünü gösterir.

**Önemli:** Birinci kitaptan gelen film kayıtlarında `owner` alanı yoktur. Bu kayıtlar otomatik olarak bir kullanıcıya ait yapılmadı. Önceki listeleme yolları korunurken, owner gerektiren değişiklikler eski kayıtlara erişimi sınırlar. Bu sürüm henüz bağımsız MongoDB entegrasyon testlerinden geçirilmedi; kod sözdizimi ve yerel import bağlantıları kontrol edildi.
