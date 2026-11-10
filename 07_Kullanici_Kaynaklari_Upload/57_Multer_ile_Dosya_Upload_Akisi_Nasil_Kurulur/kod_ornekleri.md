# Bölüm 57 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

ümde**, avatarı saklama seçeneklerini öğrendikten sonra 50. bölümdeki yardım talebine isteğe bağlı dosya ekleyeceğiz. O örnekte dosyayı kalıcı olarak saklamayacak, taramadan sonra yalnızca destek e-postasına ekleyeceğiz. İlk aşamada yalnız alma ve sınırlandırma işini kuracağız.

## İlk Hedefimiz: Tek Avatar Dosyası

Ada’nın fotoğrafı bir JSON metni olarak değil, `multipart/form-data` isteği içindeki dosya alanı olarak gelecek. **Bu bölümde** tek fotoğrafı en fazla 2 MB olacak şekilde karşılayıp kısa süre **Node.js belleğinde (RAM)** tutacağız. Multer’ın aldığı bu baytlar henüz dosyaya veya MongoDB’ye kaydedilmiş değildir. **58. bölümde** görüntüyü WebP biçiminde işleyip önce `uploads/avatars/` klasörüne kaydedeceğiz. Ardından aynı `POST /users/me/avatar` yolunu bozmadan fotoğrafı **Cloudinary adlı bulut hizmetine** yükleme seçeneğini de uygulayacağız. Her iki yöntemde de `User` kaydı fotoğrafın kendisini değil, ona ulaşılacak adresi tutacak.

Dosyayı karşılayacak **ara katman (middleware)** için `multer` kütüphanesini kullanacağız. Multer, isteğin içindeki metin ve dosya parçalarını ayırır; ancak fotoğrafın gerçekten açılabilir ve güvenli bir görüntü olduğunu tek başına doğrulamaz.

```bash
npm install multer
```

## Örnek 2

Fotoğrafı kabul edecek **API yolu (endpoint)** şu olacak:

```http
POST /users/me/avatar
```

## Örnek 3

Tarayıcı dosyayı `avatar` adlı **form alanına (field)** koyacak:

```text
avatar
```

## Örnek 4

Böylece Multer, `avatar` alanından gönderilen **tek dosyayı** işleyebilecek. `photo` adlı farklı bir alan gönderilirse istek beklediğimiz biçimde olmadığı için reddedilir. Dosyanın gerçekten resim olduğu ise ayrıca doğrulanmalıdır.

---

## Multer Ara Katmanı

Dosya:

```text
src/middlewares/uploadAvatar.js
```

## Örnek 5



```js
import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error("Desteklenmeyen dosya türü.");
    error.status = 415;
    return callback(error);
  }

  callback(null, true);
};

const acceptAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },
}).single("avatar");

export const uploadAvatar = (req, res, next) => {
  acceptAvatar(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      error.status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    }
    return next(error);
  });
};
```

## Örnek 6

Bu ara katman (`middleware`), gelen dosyayı geçici olarak bellekte tutar; dosya bilgilerine `req.file` üzerinden ulaşır. Dosya 2 MB sınırını aşarsa Multer’ın `LIMIT_FILE_SIZE` hatasını **413 (yük çok büyük)** yanıtına, beklenmeyen dosya alanı gibi diğer Multer hatalarını **400** yanıtına dönüştürüyoruz. İstemcinin bildirdiği desteklenmeyen tür ise **415** olur. Multer callback kullandığı için buradaki `next(error)` gereklidir; Express 5’in `async` Promise hatalarını otomatik aktarması bu callback’in sonucunu kendiliğinden iletmez. Buradaki **`multer.memoryStorage()`**, 17–19. bölümlerdeki **`express-session` oturum kayıtları için kullanılan `MemoryStore` ile aynı şey değildir**. İlki yüklenen fotoğrafın baytlarını kısa süreli tutar; ikincisi giriş yapan kullanıcıların oturum kayıtlarını saklar.

---

## Fotoğrafı Neden Geçici Olarak Bellekte Tutuyoruz?

Bu projede dosyayı hemen diske kaydetmek yerine, fotoğrafın **baytlarını kısa süreli bellekte tutan bir tampon (`buffer`)** elde etmek istiyoruz. Sonrasında bu baytlar doğrulanıp kalıcı saklama hizmetine aktarılabilir.

```text
1. Ada "Fotoğraf yükle" düğmesine basar.
2. POST /users/me/avatar isteği Movie API'ye ulaşır.
3. Multer, en fazla 2 MB'lık dosyayı geçici olarak RAM'e alır: req.file.buffer.
4. 58. bölümde kuracağımız dosya servisi görüntüyü açıp WebP olarak yeniden oluşturur.
5. 58. bölümde fotoğrafı önce yerel `uploads/avatars/` klasöründe saklarız; sonra Cloudinary seçeneğini kurarız.
6. `User.avatarUrl`, seçilen yönteme göre yerel `/uploads/avatars/...` yolunu ya da Cloudinary’nin HTTPS adresini tutar.
```

## Örnek 7

ğini RAM'de tuttuğu için, aynı anda çok sayıda veya çok büyük dosya gelirse sunucunun belleği tükenebilir. Bu yüzden `fileSize` sınırını koymak yalnızca “dosya boyutu tercihi” değil, kaynak tüketimini kontrol etme kararıdır. Bu yaklaşım küçük ve sınırlandırılmış dosyalara uygundur; büyük dosyalarda akış tabanlı bir çözüm daha doğru olabilir.

Büyük dosyalarda içeriği bütünüyle RAM’e almadan **parça parça işleyen bir akış (stream)** daha uygun olabilir.

---

Ada'nın küçük profil resmi RAM'e alındığında uygulama onu inceleyip kalıcı saklama servisine aktarabilir. Ancak kötü niyetli biri art arda büyük dosyalar gönderirse RAM tüketimi hızla artar. **`memoryStorage()` tek başına güvenli değildir**; Multer boyut limitleri, dosya sayısı sınırı, uygun istek hızı kontrolü ve gerekirse akış tabanlı işleme birlikte düşünülmelidir. `req.file` oluşması da bu dosyanın gerçekten resim olduğunu kanıtlamaz: istemcinin bildirdiği MIME türü değiştirilebilir.

## İstek Hangi Sırayla İşleniyor?

Bu bağlantıyı mevcut `src/routers/users.js` dosyasına ekleyin. `uploadAvatar` işlevini `../middlewares/uploadAvatar.js` yolundan, `updateAvatar` işlevini de `../controllers/users.js` yolundan import edeceğiz.

```js
router.post(
  "/me/avatar",
  authenticate,
  uploadAvatar,
  updateAvatar,
);
```

## Örnek 8

Önce `authenticate` çalışır: Ada giriş yapmamışsa dosyayı işleyecek Multer ara katmanına geçilmez. Giriş başarılıysa `uploadAvatar` dosyayı alır; son olarak `updateAvatar` çalışır. Bu sıra, **kimliği doğrulanmamış bir isteği mümkün olduğunca erken reddetmek** içindir.

Yine de giriş kontrolünden önce ağ üzerinden çok büyük veri gelmesi ihtimali vardır. Bu nedenle canlı sunucuda **ters vekil sunucu (reverse proxy)** veya barındırma altyapısı düzeyinde de istek boyutu sınırı uygulanabilir.

---

Bu Controller için mevcut `src/controllers/users.js` dosyasının üstündeki importlara şu bağımlılıkları ekleyin; aynı import zaten varsa ikinci kez yazmayın:

```js
import * as filesService from "../services/files.js";
import { User } from "../db/models/user.js";
import { toPublicUser } from "../utils/toPublicUser.js";
```

## Örnek 9

`filesService` modülünü 58. bölümde oluşturacağımız için, 57. bölümün sonunda bu dosyanın bulunmaması beklenir. İki bölümü birlikte uyguladığınızda Controller gereken fonksiyona ulaşacaktır.

## Controller Dosyasındaki İşlem

Bu Controller taslağının yeri mevcut `src/controllers/users.js` dosyasıdır. **`filesService.saveAvatar()` 58. bölümde `src/services/files.js` içinde yazılacak.** Aşağıdaki Controller, o fonksiyonla tamamlanacak akışın bir parçasıdır; 58. bölümü bitirmeden bu endpoint’in fotoğrafı saklayabildiğini varsaymayın. `filesService`, `User` ve `toPublicUser` bağımlılıklarını bu dosyanın mevcut import düzenine ekleyin.

```js
export const updateAvatar = async (req, res) => {
  if (!req.file) {
    const error = new Error("Avatar dosyası gerekli.");
    error.status = 400;
    throw error;
  }

  const avatarUrl = await filesService.saveAvatar({
    userId: req.user._id,
    buffer: req.file.buffer,
    mimeType: req.file.mimetype,
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { avatarUrl } },
    { returnDocument: "after" },
  );

  res.status(200).json({
    data: toPublicUser(user),
  });
};
```

## Örnek 10

er alabilen kamera/konum gibi **ek bilgilere (metadata)** sınır koyabilir. Yüksek riskli ortamlarda kötü amaçlı yazılım taraması da gerekebilir.

Bu adımlar, `fileFilter` fonksiyonunda şu an **uygulanmış değildir**. Oradaki kontrol yalnız bildirilmiş `mimetype` değerini karşılaştırır. **Multer'ın dosyayı ayrıştırabilmesi, dosyanın güvenli olduğunu kanıtlamaz**; doğrulama ihtiyacı uygulamanın riskine göre ayrıca değerlendirilmelidir.

---

Ada `profil.png` adlı dosyayı yüklediğinde dosyanın adı tarayıcıdan gelen bir bilgidir; güvenilir ve benzersiz olduğunu varsayamayız. Deniz de `profil.png` gönderebilir, kötü niyetli biri ise dosya adına beklenmeyen karakterler ekleyebilir. Bu yüzden saklama anahtarını dosyanın özgün adına göre değil, sunucunun ürettiği güvenilir bir kimliğe göre belirlemek daha uygundur.

`memoryStorage()` kullandığımızda dosyanın baytları geçici olarak Node.js belleğine alınır. Bu, sınırları belirli küçük bir avatarı başka saklama hizmetine göndermeden önce incelemek için yararlı olabilir; **dosyanın kalıcı olarak saklandığı anlamına gelmez**. Boyut sınırı bu yüzden önemlidir.

## Kullanıcının Gönderdiği Dosya Adını Neden Aynen Saklamıyoruz?

Birisi dosya adını:

```text
../../avatar.png
```

## Örnek 11

olarak gönderebilir. Buradaki `../`, dosya yollarında **bir üst klasöre çıkmak** için kullanılır. Dosya adını denetlemeden bir yola birleştirmek, saklanması gereken klasörün dışına çıkma riskini doğurabilir. Başka biri de Ada ile aynı dosya adını seçebilir; bu yüzden özgün ada güvenerek kayıt oluşturamayız.

Dosyanın saklama alanındaki **benzersiz adı veya anahtarı** (`storage key`) sunucu tarafından üretilmelidir:

```text
avatars/<userId>/<random-id>.webp
```

## Örnek 12

Kullanıcının gönderdiği özgün dosya adını, gerekirse yalnızca ekranda gösterilecek bir bilgi olarak tutabiliriz; kalıcı saklama anahtarı olarak kullanmayız.

---

## Multer Hatalarını Tutarlı API Yanıtlarına Dönüştürelim

Dosya boyutu 2 MB sınırını aştığında Multer `LIMIT_FILE_SIZE` adında özel bir **hata kodu** verebilir. Merkezi **hata işleme ara katmanı (error middleware)** bu durumu kullanıcıya anlaşılır bir HTTP yanıtına dönüştürebilir:

```text
LIMIT_FILE_SIZE
→ 413 Payload Too Large
```

## Örnek 13

İzin verilmeyen dosya türü:

```text
400 Bad Request
```
