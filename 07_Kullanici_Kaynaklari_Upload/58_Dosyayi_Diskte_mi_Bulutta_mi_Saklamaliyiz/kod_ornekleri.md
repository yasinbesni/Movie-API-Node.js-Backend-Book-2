# Bölüm 58 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

|---|
| Gelen dosyanın geçici baytları | Node.js belleği | `req.file.buffer` |
| İşlenmiş fotoğrafın gerçek içeriği | Uygulama sunucusunun diski | `uploads/avatars/ada-id-8f2a.webp` |
| Fotoğrafı bulmaya yarayan yol | MongoDB `User.avatarUrl` | `/uploads/avatars/ada-id-8f2a.webp` |
| Kullanıcının fotoğrafı açmak için isteyeceği adres | Express'in dosya sunma yolu | `GET /uploads/avatars/ada-id-8f2a.webp` |

**Önemli:** `User.avatarUrl`, resmin kendisi değildir. Ada'nın fotoğrafı bellekte değil, diskteki `.webp` dosyasında bulunur. Veritabanındaki alan yalnızca bu dosyanın adresini hatırlatır. Bu ayrımı gerçekten çalışır bir yerel örnekle kuralım.

## Dosya Servisi: Fotoğrafı Aç, WebP Oluştur ve Diske Yaz

Multer'ın dosyayı alması, yüklenen şeyin gerçekten geçerli bir görsel olduğunu kanıtlamaz. `sharp` kütüphanesiyle veriyi görüntü olarak açmayı deneyip **yeni bir WebP dosyası** oluşturacağız. `decode` burada gelen görsel verisini çözümlemek, `encode` ise çözümlenen görüntüyü seçtiğimiz biçimde yeniden dosyaya dönüştürmek anlamına geliyor. **WebP**, tarayıcıların gösterebildiği bir görsel dosya biçimidir; fotoğrafları daha küçük boyutlarda saklamak için tercih edilebilir.

Kurulum:

```bash
npm install sharp
```

## Örnek 2

Yeni dosya: `src/services/files.js`.

```js
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export const avatarDirectory = path.join(
  process.cwd(), "uploads", "avatars",
);

// İki saklama yönteminde de kullanılacak görsel hazırlama adımı.
const prepareAvatarWebp = async (buffer) => {
  try {
    const image = sharp(buffer, {
      limitInputPixels: 16_000_000,
      failOn: "error",
    });
    const info = await image.metadata();
    if (!["jpeg", "png", "webp"].includes(info.format)) {
      throw new Error("Desteklenmeyen görsel biçimi.");
    }

    return await image
      .rotate()
      .resize(512, 512, { fit: "cover" })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    const error = new Error("Geçerli bir görsel yükleyin.");
    error.status = 400;
    throw error;
  }
};

const saveAvatarToDisk = async ({ userId, webp }) => {
  await mkdir(avatarDirectory, { recursive: true });
  const filename = `${userId.toString()}-${randomUUID()}.webp`;
  await writeFile(path.join(avatarDirectory, filename), webp, {
    flag: "wx",
  });

  return `/uploads/avatars/${filename}`;
};

export const saveAvatar = async ({ userId, buffer }) => {
  const webp = await prepareAvatarWebp(buffer);
  return saveAvatarToDisk({ userId, webp });
};
```

## Örnek 3

prepareAvatarWebp()` fotoğrafı bir kez işler; sonrasında dosyayı **diske veya buluta** gönderebiliriz. `metadata()` gelen verinin gerçek görüntü biçimini okur; `rotate()` gerekli yön düzeltmesini yapar, `resize()` resmi 512 × 512 boyutuna getirir, `webp()` yeni dosyayı üretir. Bu örnekte kare avatar için `fit: "cover"` seçildiğinden görüntünün kenarları kırpılabilir. `process.cwd()` uygulama proje kökünden çalıştırıldığında o klasörü gösterir. `mkdir` saklama klasörünü oluşturur; `randomUUID()` dosyalara benzersiz ad verir. `flag: "wx"` yanlışlıkla mevcut dosyanın üzerine yazmayı önler. Görseli yeniden oluşturmak riski azaltabilir; tek başına bütün dosya güvenliği sorunlarını çözmez.

Bu ilk örnekte `saveAvatar()` **yerel diske gerçekten yazar**. `prepareAvatarWebp()` görüntüyü hazırlar, `saveAvatarToDisk()` ise işlenmiş dosyayı saklar. Bu iki işi ayırmamızın nedeni, az sonra Cloudinary’ye geçtiğimizde **görüntü işleme kodunu yeniden yazmak zorunda kalmamamızdır**. `writeFile` başarısız olursa işlem hata verir; başarılıymış gibi yanıt göndermeyiz.

## MongoDB Dosyanın Kendisini Değil, Erişim Yolunu Tutar

Mevcut `src/db/models/user.js` içindeki `userSchema` alanlarına şunu ekleyin:

```js
avatarUrl: { type: String, default: null },
```

## Örnek 4

Bu bir nesne özelliğidir; tek başına yeni `userSchema` tanımı değildir. 57. bölümdeki `updateAvatar` Controller'ı `filesService.saveAvatar()` sonucunu `{ $set: { avatarUrl } }` ile ilgili kullanıcıya yazar. Yerel diskte bu sonuç `/uploads/avatars/...webp`, Cloudinary seçeneğinde ise `https://res.cloudinary.com/...` adresi olur. **Fotoğrafın kendisi hiçbirinde `User` belgesine yazılmaz.**

`src/utils/toPublicUser.js` içindeki mevcut dönüş nesnesine de şunu ekleyin:

```js
avatarUrl: user.avatarUrl ?? null,
```

## Örnek 5

Bu alan eklenmezse dosya kaydedilse bile Ada'nın profil API yanıtında fotoğrafın adresi görünmez. `null`, fotoğraf yüklenmediğini anlatır. Örneğin dönen yol `/uploads/avatars/ada-id-8f2a.webp` ise tarayıcı bunu Movie API'nin adresiyle birleştirerek `https://api.example.com/uploads/avatars/ada-id-8f2a.webp` üzerinden isteyebilir. Bu yalnızca **örnek adres**; kullanacağınız alan adı kendi API'nizinkidir.

## Express Kaydedilmiş Fotoğrafı Nasıl Gösterir?

Diske yazmak yeterli değildir: Tarayıcı `uploads/avatars/` klasörünü kendi kendine okuyamaz. Express'in bu klasördeki **herkese açık avatar dosyalarını** HTTP üzerinden sunmasını sağlamalıyız. Mevcut `src/server.js` dosyasına, hata yöneticisinden önce, şu bağlantıyı ekleyin:

```js
import { avatarDirectory } from "./services/files.js";

app.use(
  "/uploads/avatars",
  express.static(avatarDirectory),
);
```

## Örnek 6

avatarUrl` alanına kaydeder. **MongoDB'de görüntünün baytları yoktur.**
4. Ada'nın profili istendiğinde `toPublicUser()` `avatarUrl` değerini döndürür. Görseli göstermek isteyen istemci bu adrese ayrı `GET` isteği yollar.
5. Express, klasördeki gerçek dosyayı bulup yanıtlar. Yalnızca aynı diske erişen bu uygulama kopyası için örnek tamamlanmıştır.

**Kendiniz sınayın:** Fotoğraf yükleyin, yanıttaki `avatarUrl` değerini kontrol edin; `uploads/avatars/` içinde yeni `.webp` dosyasını görün ve adresi tarayıcıda açın. Node.js işlemini durdurup **aynı bilgisayarda, aynı klasörden** yeniden başlatın. Dosya duruyorsa fotoğraf yeniden görüntülenebilir. Ancak bu test, buluta dağıtıldığında da saklanacağını kanıtlamaz.

---

## Geçici Diskte Dosya Neden Kaybolabilir?

Bazı barındırma hizmetlerinde uygulama her yeni dağıtımda veya sunucu kopyası yenilendiğinde **yeni bir disk alanıyla** başlatılır. Ada'nın fotoğrafını yalnız o sunucunun içine kaydettiysek fotoğrafı daha sonra bulamayabiliriz. **Geçici disk (ephemeral disk)** dediğimiz risk budur; her sunucunun diskinin mutlaka geçici olduğunu söylemiyoruz.

Bir uygulamanın aynı anda çalışan iki **sunucu kopyası (instance)** olduğunu düşünelim:

```text
Ada'nın fotoğrafı → Sunucu A'nın diskine kaydedildi
Deniz'in isteği → Sunucu B'ye ulaştı
Sunucu B'nin diskinde Ada'nın fotoğrafı yok
```

## Örnek 7

aklamak

Yerel örnekte `uploads/avatars/` klasöründeki fotoğraf yalnız o sunucunun diskindedir. Ada'nın fotoğrafı başka bir sunucu kopyasından da görülebilsin istiyorsak dosyanın kendisini **Node.js sunucusundan bağımsız** bir yerde tutabiliriz. Bunun uygulamalı örneğini **Cloudinary** ile kuracağız. Cloudinary, yüklenen görüntüyü saklayan ve görüntülemek için bir HTTPS adresi döndüren bir bulut görsel hizmetidir.

Bu yöntemle de Ada aynı **`POST /users/me/avatar`** isteğini gönderir. `authenticate`, Multer, Controller, `User.avatarUrl` ve `toPublicUser()` değişmez. **Yalnızca Service katmanındaki saklama tercihi değişir.**

![Ada'nın avatar fotoğrafı için yerel disk ve Cloudinary saklama akışlarının karşılaştırması](../assets/diagrams/58-avatar-yerel-cloudinary-akis.svg)

Şemadaki iki yol **alternatiftir**. Bir fotoğrafı hem yerel diske hem Cloudinary’ye yazmak zorunda değiliz. Yerel yöntemde `User.avatarUrl` `/uploads/avatars/...webp` değerini; Cloudinary yönteminde ise örneğin `https://res.cloudinary.com/.../image/upload/...webp` adresini tutar. İkisi de **adres metnidir**; MongoDB’de fotoğrafın baytları yoktur.

### 1. Cloudinary Paketini ve Ayarlarını Ekleyelim

Proje kökünde:

```bash
npm install cloudinary
```

## Örnek 8

cret_tutorial) izleyin.

![Cloudinary yönetim panelindeki cloud_name, api_key ve api_secret alanlarının konumunu gösteren temsili görsel](../assets/diagrams/58-cloudinary-api-bilgileri-nerede.png)

*Görsel, alanların yerini öğretmek amacıyla hazırlanmış **temsili bir panel çizimidir**; gerçek bir hesaptan alınmış ekran görüntüsü değildir. Gösterilen değerler de örnektir.*

Bu üç bilgi farklı görevler üstlenir:

- **`cloud_name`:** Fotoğrafları saklayacağımız Cloudinary ortamını tanımlar. Dosyanın sunulacağı adreste de yer alır.
- **`api_key`:** Movie API'nin Cloudinary'ye yaptığı sunucu tarafı isteklerde kullanılan anahtar kimliğidir. Tek başına gizli anahtarın yerini tutmaz.
- **`api_secret`:** Sunucunun yetkili isteklerini doğrulamak için kullandığı **gizli anahtardır**. API Keys sayfasında gizlenmiş olabilir; görüntülemek için ek doğrulama istenebilir. Bu değeri **asla tarayıcı koduna, GitHub'a, kitap görsellerine veya ekran görüntülerine koymayın**.

Şimdi bu bilgileri, **proje kökündeki `.env`** dosyasında aşağıdaki değişkenlere karşılık gelecek şekilde yazın. Örnek değerler **yer tutucudur, çalışan anahtar değildir**; kendi hesabınızdan aldığınız değerlerle değiştirmelisiniz:

```dotenv
# Yerel yöntem için: local  |  Bulut için: cloudinary
AVATAR_STORAGE=cloudinary
CLOUDINARY_CLOUD_NAME=ornek-cloud
CLOUDINARY_API_KEY=ornek-api-key
CLOUDINARY_API_SECRET=ornek-gizli-anahtar
```

## Örnek 9

Mevcut `src/config/env.js` içindeki `env` nesnesine şu alanları **bir kez** ekleyin:

```js
avatarStorage: process.env.AVATAR_STORAGE?.trim() || "local",
cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME?.trim() || "",
cloudinaryApiKey: process.env.CLOUDINARY_API_KEY?.trim() || "",
cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET?.trim() || "",
```

## Örnek 10

Aynı dosyada `env` nesnesi oluşturulduktan hemen sonra bu kontrolü ekleyin:

```js
if (!["local", "cloudinary"].includes(env.avatarStorage)) {
  throw new Error("AVATAR_STORAGE local veya cloudinary olmalı.");
}

if (env.avatarStorage === "cloudinary" &&
    (!env.cloudinaryCloudName || !env.cloudinaryApiKey ||
     !env.cloudinaryApiSecret)) {
  throw new Error("Cloudinary ortam ayarları eksik.");
}
```

## Örnek 11

Bu kontrol, eksik ayarlarla fotoğraf yüklemeye çalışmak yerine uygulamayı başlangıçta durdurur. Yerelde çalışacaksanız `AVATAR_STORAGE=local` yazabilir veya değişkeni hiç tanımlamayabilirsiniz. Cloudinary anahtarlarını istemci tarafına, Git deposuna ya da API yanıtına koymayın.

### 2. Buluta Yükleme İşlevini Oluşturalım

Yeni dosya: **`src/services/cloudinary.js`**.

```js
import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

export const uploadAvatarToCloudinary = (webpBuffer) => {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true,
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "movie-api/avatars",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url) {
          return reject(new Error("Cloudinary adres döndürmedi."));
        }
        resolve(result.secure_url);
      },
    );

    stream.on("error", reject);
    stream.end(webpBuffer);
  });
};
```

## Örnek 12

pBuffer)` işlenmiş WebP verisini buradan buluta gönderir. **Bu tercih RAM kullanımını ortadan kaldırmaz**; Multer dosyayı zaten belleğe almıştır. Burada amaç, Base64 metnine dönüştürmeden dosyanın gerçek baytlarını göndermektir.

`folder`, fotoğrafların Cloudinary hesabında düzenleneceği klasördür; Movie API’ye ait `movie-api/avatars` adını kullandık. `secure_url` Cloudinary’nin verdiği **HTTPS görüntüleme adresidir**. HTTPS kullanılması, dosyanın yalnız yetkili kişilere açık olduğu anlamına **gelmez**: Bu örnekte avatarlar herkese açık görüntülenebilir. Özel dosyalar için ayrıca erişim tasarımı gerekir.

Bazı uygulamalarda görsel **Base64 biçimindeki metin** olarak gönderilir ve `uploader.upload(base64Image)` kullanılabilir. Fakat burada tarayıcı `multipart/form-data` gönderdiği ve Multer bize zaten dosya baytlarını verdiği için **görseli Base64 metnine çevirip tekrar aktarmıyoruz**. Ayrıca `prepareAvatarWebp()` boyutlandırma ve yeni WebP oluşturma işini yaptığından Cloudinary’ye ikinci kez aynı dönüşümü yaptırmıyoruz.

### 3. Yerel ve Bulut Yöntemini Tek `saveAvatar()` Üzerinden Seçelim

Şimdi mevcut **`src/services/files.js`** dosyasına, diğer importların yanına şunları ekleyin:

```js
import { env } from "../config/env.js";
import { uploadAvatarToCloudinary } from "./cloudinary.js";
```

## Örnek 13

Aynı dosyanın en altındaki **mevcut `export const saveAvatar = ...` fonksiyonunu** aşağıdakiyle **değiştirin**. `prepareAvatarWebp`, `saveAvatarToDisk` ve `avatarDirectory` aynen kalacak; dosyada iki ayrı `saveAvatar` tanımı bulunmayacak.

```js
export const saveAvatar = async ({ userId, buffer }) => {
  const webp = await prepareAvatarWebp(buffer);

  if (env.avatarStorage === "cloudinary") {
    try {
      return await uploadAvatarToCloudinary(webp);
    } catch {
      const error = new Error("Fotoğraf buluta yüklenemedi.");
      error.status = 502;
      throw error;
    }
  }

  return saveAvatarToDisk({ userId, webp });
};
```

## Örnek 14

storage key)**, erişim adresi (herkese açık veya izin gerektiren URL) ve gerekli **ek bilgiler (metadata; örneğin dosya türü ve yükleme zamanı)** tutulur. Fotoğrafın asıl içeriği ayrı dosya saklama hizmetinde kalır.

---

## Her Dosya Herkes Tarafından Görülebilir mi?

Profil fotoğrafı herkesin görebileceği biçimde paylaşılabilir. Ancak yüklenen her dosyanın **herkese açık (public)** olması doğru değildir. Örneğin kimlik belgesini düşünelim: Bu dosyayı **özel erişimli saklama alanında (private bucket)** tutarız. Görme yetkisi olan kişiye gerektiğinde **belirli bir süre çalışan imzalı bağlantı (signed URL)** verebiliriz. Bağlantının süresi dolduğunda aynı adres yeniden kullanılamaz.

**Süreli bağlantı tek başına kimin yetkili olduğuna karar vermez.** Sunucu, bağlantıyı vermeden önce kullanıcının erişim iznini (*authorization*) kontrol etmelidir. Böylece "fotoğrafı nerede tutuyoruz?" sorusu ile "kim görebilir?" sorusunu birbirinden ayırırız.

---

## Eski Avatarı Değiştirince Ne Olacak?

Ada yeni profil fotoğrafını başarıyla yükledi.

Eski fotoğrafı saklama hizmetinde süresiz bırakmak, kullanılmayan dosyaların birikmesine ve gereksiz maliyete yol açar.

Akış şu şekilde planlanabilir:

```text
Yeni dosyayı sakla
↓
MongoDB’de fotoğrafın erişim yolunu güncelle
↓
Eski dosyayı güvenli biçimde silmeyi dene
```

## Örnek 15

mizlik işlemi (cleanup)** denir.

Örneğin belirli aralıklarla çalışan bir görev, hiçbir kullanıcının profilinde artık kullanılmayan dosyaları tespit edip silebilir. Temizleme başarısız olursa güvenli biçimde yeniden denenebilir. **Burada yazdığımız `saveAvatar()` yeni fotoğrafı seçilen yerde saklar; eski avatarı ise ne yerel diskten ne Cloudinary’den siler.** Ayrıca diske yazma başarılı olup kullanıcı kaydını güncelleme başarısız olursa gereksiz dosya kalabilir. Bu nedenle eski/boşta kalan dosyaları temizleme ve başarısız güncellemelerde telafi adımları canlı sistemin ayrı tamamlanması gereken işidir; bu örnekte eski dosyaları otomatik kaldıran bir hizmet kurmadık.

---



## Fotoğraf Neden Hâlâ Eski Hâliyle Görünebilir?

Herkese açık profil fotoğrafları, kullanıcıya yakın sunuculardan görüntü sunan bir **CDN (içerik dağıtım ağı)** üzerinden erişilebilir hâle getirilebilir.

Tarayıcı veya CDN, daha önce yüklediği fotoğrafın bir **kopyasını önbellekte (cache)** tutabilir. Ada yeni fotoğraf yüklediği hâlde eski dosyanın adresini kullanmaya devam ederse ekranında bir süre eski fotoğraf görünebilir.

Bunu azaltmak için her yeni fotoğrafa **yeni ve benzersiz bir dosya adı** verilebilir:

```text
avatars/user-id/uuid.webp
```

## Örnek 16

ent volume)** tutabiliyorsak ve düzenli **yedek (backup)** alıyorsak yerel disk de makul bir seçim olabilir. Ayrıca başka sunucu kopyalarının aynı dosyalara ihtiyaç duymadığından emin olmalıyız.

Önemli olan, "projede `uploads/` klasörü var" diye dosyaların canlı ortamda kendiliğinden kalıcı olacağını varsaymamaktır.

---

## Yardım Talebine Güvenli Dosya Eki Ekleyelim

Ada'nın profil fotoğrafını kalıcı olarak saklamayı çözdük. Peki fotoğrafını değiştirmeye çalışırken hata alırsa ne olacak? 50. bölümde oluşturduğumuz `POST /support/requests` yoluyla sorunu destek ekibine yazabiliyor. Şimdi hata mesajının ekran görüntüsünü de göndermek istiyor. Kimi zaman küçük bir PDF raporu da ekleyebilir. **Destek talebi yine yalnızca mesajla gönderilebilecek; dosya eklemek zorunlu olmayacak.**

Bu kez dosyayı profilinde göstermek istemiyoruz. Ekran görüntüsü veya PDF, yalnızca destek ekibine ulaşması için gerekli. Multer dosyayı istek boyunca bellekte tutacak; dosya türü ve güvenlik kontrolleri başarılıysa Nodemailer eki destek ekibine gönderecek. **Bu dosyayı `uploads/` klasörüne veya Cloudinary'ye kalıcı olarak kaydetmeyeceğiz.** Ada'ya giden otomatik alındı e-postasında da dosya bulunmayacak.

```text
Ada: “Fotoğrafımı güncelleyemiyorum.” + isteğe bağlı ekran görüntüsü
     ↓
POST /support/requests (mesaj + varsa attachment alanı)
     ↓
Kimlik doğrulama → e-posta doğrulama → istek sınırı → Multer
     ↓
Gerçek dosya türü ve boyutu → zararlı yazılım taraması
     ↓
Resimse yeniden WebP oluşturma; PDF ise ek belge kontrolü
     ↓
Nodemailer → destek adresine mesaj + temizlenmiş/taranmış ek
     ↓
Ada'ya ayrı alındı e-postası (dosya eklenmez)
```

## Örnek 17

Buradaki **zararlı yazılım taraması (antivirus/malware scan)**, bilinen zararlı içerikleri arayan bir kontrol mekanizmasıdır. Zararlı dosyaları tespit etmeye yardımcı olur; ancak **“tarama temiz çıktı” hiçbir dosyanın yüzde yüz zararsız olduğunun garantisi değildir**. Bu nedenle tek kontrole güvenmeyeceğiz. Önce neyi kabul edeceğimizi sınırlandırıp sonra içeriği inceleyeceğiz. Dosya yoksa önceki metin tabanlı yardım talebi aynı şekilde çalışacak.

![Yardım talebinde isteğe bağlı dosyanın taranarak e-postaya eklenmesi](../assets/diagrams/58-destek-talebi-guvenli-ek-akisi.svg)

*Şema, güvenlik kontrollerinin hangi sırayla uygulandığını gösterir. Zararlı yazılım taraması tek başına kesin güvenlik sağlamaz.*

### 1. Dosya türünü ve sınırlarını belirleyelim

Geliştirme bilgisayarında `package.json` bulunan klasörde:

```bash
npm install file-type
```

## Örnek 18

Multer ve Sharp'ı 57–58. bölümlerde zaten kurduk; burada yeniden yüklemiyoruz. İlk örneğimizde **bir talebe en fazla bir dosya, en çok 2 MB** kabul edeceğiz. İzin verilen türler JPG, PNG, WebP ve PDF. ZIP, HTML, SVG, JavaScript, Office makro dosyaları ve çalıştırılabilir dosyalar kabul edilmeyecek. Özgün dosya adı posta ekine taşınmayacak; sunucu güvenilir bir ad üretecek.

`src/middlewares/uploadSupportAttachment.js` adında yeni bir dosya oluşturun:

```js
import multer from "multer";

const allowed = new Set([
  "image/jpeg", "image/png", "image/webp", "application/pdf",
]);

const accept = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // En fazla 2 MB
    files: 1, fields: 1, parts: 2,
    fieldSize: 8 * 1024,
  },
  fileFilter(req, file, callback) {
    // Bu erken kontrol yalnızca istemcinin bildirdiği türü inceler.
    if (!allowed.has(file.mimetype)) {
      const error = new Error("Yalnızca JPG, PNG, WebP veya PDF kabul edilir.");
      error.status = 415;
      return callback(error);
    }
    callback(null, true);
  },
}).single("attachment");

export const uploadSupportAttachment = (req, res, next) => {
  accept(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      error.status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    }
    next(error);
  });
};
```

## Örnek 19

`memoryStorage()`, içeriği **geçici olarak RAM'e almak** demektir; dosya kendi kendine diske kaydedilmez. `parts: 2` sınırı, bir `message` alanı ve en fazla bir `attachment` alanı içindir. JPEG diye bildirilmiş bir dosyanın gerçekten JPEG olup olmadığını **bu aşamada henüz bilmiyoruz**: `mimetype` kullanıcı tarafından taklit edilebilir. Bir sonraki Service gerçek dosya türünü baytlarından kontrol edecek.

### 2. Zararlı yazılım taraması gerçekten çalışıyor mu?

Dosya eki göndermeden önce tarama yapmak için ayrı bir **ClamAV `clamd` hizmeti** kullanacağız. `clamd`, sunucunun kendisine gönderdiği dosya baytlarını bilinen zararlı yazılım imzalarıyla karşılaştıran bir tarama hizmetidir. **`npm install` bu hizmeti kendi başına kurmaz**; ClamAV ayrıca kurulup çalıştırılmalıdır.

Örneğin Docker kullanan bir geliştirme bilgisayarında, yalnızca aynı bilgisayardan erişilebilen bir bağlantı açılabilir:

```bash
docker run -d --name movie-api-clamav -p 127.0.0.1:3310:3310 clamav/clamav:stable
```

## Örnek 20

İlk açılışta virüs imza veritabanının hazırlanması nedeniyle tarama hizmeti hemen hazır olmayabilir. Yeterli bellek gerekir; güncel imzalar, hizmet sağlığı ve günlükler ayrıca izlenmelidir. ClamAV'ı bulut sunucusunda veya farklı bir Docker ağında çalıştırıyorsanız adres değişebilir. **`3310` portunu herkese açık internete açmayın:** bu protokol kendi başına kimlik doğrulama ve şifreleme sağlamaz. Resmî açıklamalar: [ClamAV Docker](https://docs.clamav.net/manual/Installing/Docker.html) ve [INSTREAM protokolü](https://docs.clamav.net/manual/Usage/ClamdProtocol.html).

Proje kökündeki `.env` dosyasına tarayıcının sunucu tarafından erişilebilen adresini girin:

```dotenv
CLAMAV_HOST=127.0.0.1
CLAMAV_PORT=3310
```

## Örnek 21

Bu iki ayarı **`getRequiredString()` ile uygulama açılır açılmaz zorunlu hâle getirmiyoruz**. Aksi hâlde ClamAV henüz kurulmamışsa parola sıfırlama ve e-posta doğrulama bile durabilir. Tarayıcı yokken **yalnızca dosya ekli yardım talebi `503` ile reddedilecek**. Dosyasız yardım talebi yine işlenebilecek.

Yeni `src/services/scanSupportAttachment.js` dosyası:

```js
import { createConnection } from "node:net";

export const scanSupportAttachment = async (buffer) => {
  const host = process.env.CLAMAV_HOST?.trim();
  const port = Number(process.env.CLAMAV_PORT || 3310);
  const unavailable = () => {
    const error = new Error("Dosya güvenlik taraması şu anda kullanılamıyor.");
    error.status = 503;
    return error;
  };

  if (!host || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw unavailable();
  }

  // ClamAV INSTREAM: komut, 4 baytlık uzunluk, veri, sıfır uzunluk.
  let answer;
  try {
    answer = await new Promise((resolve, reject) => {
      const socket = createConnection({ host, port });
      let settled = false;
      let received = Buffer.alloc(0);

      const finish = (error, value) => {
        if (settled) return;
        settled = true;
        socket.destroy();
        if (error) reject(error);
        else resolve(value);
      };

      socket.setTimeout(15000, () => finish(new Error("Tarama zaman aşımı")));
      socket.on("error", (error) => finish(error));
      socket.on("close", () => finish(new Error("Tarama bağlantısı kapandı")));
      socket.on("connect", () => {
        const size = Buffer.alloc(4);
        size.writeUInt32BE(buffer.length);
        socket.write(Buffer.concat([
          Buffer.from("zINSTREAM\0"), size, buffer, Buffer.alloc(4),
        ]));
      });
      socket.on("data", (chunk) => {
        received = Buffer.concat([received, chunk]);
        if (received.length > 1024) {
          return finish(new Error("Beklenmeyen tarama yanıtı"));
        }
        const end = received.indexOf(0);
        if (end !== -1) finish(null, received.subarray(0, end).toString());
      });
    });
  } catch {
    throw unavailable();
  }

  if (answer === "stream: OK") return;
  if (answer.startsWith("stream: ") && answer.endsWith(" FOUND")) {
    const error = new Error("Dosya güvenlik kontrolünden geçemedi.");
    error.status = 422;
    throw error;
  }
  // Tarama tamamlanmadıysa dosyayı 'temiz' saymıyoruz.
  throw unavailable();
};
```

## Örnek 22

`INSTREAM`, dosyayı tarama hizmetine **bellekteki baytlar üzerinden parça/uzunluk bilgisiyle gönderme protokolüdür**; ayrı bir dosya yolu yazmak zorunda değiliz. `stream: OK` yanıtı yalnızca tarayıcının bilinen tehdit bulmadığını söyler. `FOUND` ise taranan içerikte tanınan bir tehdit bulunduğu anlamına gelir. Bağlantı kopması, zaman aşımı veya anlaşılmayan yanıt **başarılı tarama sayılmaz**. Bu davranışa *fail closed* (güvenlik kontrolü başarısızsa işlemi durdurma) denir.

### 3. Gerçek dosya türünü inceleyip güvenilir eki hazırlayalım

Yeni `src/services/prepareSupportAttachment.js` dosyasında önce dosyanın **imzasını (magic bytes / içeriğin başlangıç işaretlerini)** okuyacağız. Dosyanın yalnızca adından veya tarayıcının bildirdiği türden karar vermeyeceğiz. Sonra dosyayı ClamAV'a göndereceğiz.

```js
import { randomUUID } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { scanSupportAttachment } from "./scanSupportAttachment.js";

const allowed = new Set([
  "image/jpeg", "image/png", "image/webp", "application/pdf",
]);

const invalidType = () => {
  const error = new Error("Dosya türü veya içeriği desteklenmiyor.");
  error.status = 415;
  return error;
};

export const prepareSupportAttachment = async (file) => {
  if (!file) return []; // Yalnız mesaj gönderen Ada'yı engellemiyoruz.

  const detected = await fileTypeFromBuffer(file.buffer);
  if (!detected || !allowed.has(detected.mime) ||
      detected.mime !== file.mimetype) {
    throw invalidType();
  }

  // Özgün dosya zararlıysa hiçbir e-postaya ekleme.
  await scanSupportAttachment(file.buffer);

  if (detected.mime === "application/pdf") {
    return [{
      filename: `destek-${randomUUID()}.pdf`,
      content: file.buffer,
      contentType: "application/pdf",
      contentDisposition: "attachment",
    }];
  }

  let safeImage;
  try {
    safeImage = await sharp(file.buffer, {
      limitInputPixels: 16_000_000,
      failOn: "error",
    })
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    throw invalidType();
  }

  // Yeniden kodlanmış baytlar da tarama denetiminden geçsin.
  await scanSupportAttachment(safeImage);
  return [{
    filename: `destek-${randomUUID()}.webp`,
    content: safeImage,
    contentType: "image/webp",
    contentDisposition: "attachment",
  }];
};
```

## Örnek 23

ında destek e-postasında `destek-...webp` adlı ek görülecek: dosyanın adı artık istemcinin verdiği yol veya isim değil, sunucunun ürettiği değerdir. **WebP'ye dönüştürme**, görüntüyü yeniden oluşturarak bazı istenmeyen ek verilerin taşınma ihtimalini azaltır; her türlü zararlı içeriği kesinlikle yok ettiğini iddia etmiyoruz.

**PDF daha dikkatli değerlendirilmelidir.** PDF bir ekran görüntüsünden farklı olarak bağlantı, betik veya karmaşık içerik barındırabilir. Burada PDF'yi antivirüs kontrolünden geçirerek eki oluşturuyoruz; ancak bu, PDF'yi tamamen etkisiz hâle getirme (*CDR / içerik temizleyip yeniden oluşturma*) işlemi değildir. Daha yüksek güvenlik gerektiren bir ortamda PDF eklerini bir CDR hizmetinden geçirmeden kabul etmemek veya **PDF desteğini kapalı tutmak** daha uygun olabilir. Gönderilen ekleri destek görevlilerinin güvenilmeyen dosya olarak değerlendirmesi gerekir.

### 4. Var olan destek yolunu dosya ekini anlayacak biçimde güncelleyelim

50. bölümde `src/services/email.js` içinde oluşturduğumuz `sendEmail()` fonksiyonunu **silip ikinci bir gönderici yazmayın**. Var olan fonksiyonun `attachments` adlı isteğe bağlı parametreyi de kabul etmesini sağlayın. Güncel hâli:

```js
import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpPort === 465,
  auth: { user: env.smtpUser, pass: env.smtpPass },
});

export const sendEmail = ({ to, subject, text, html, replyTo, attachments }) =>
  transporter.sendMail({
    from: env.emailFrom,
    to,
    subject,
    text,
    html,
    ...(replyTo ? { replyTo } : {}),
    ...(attachments?.length ? { attachments } : {}),
  });
```

## Örnek 24

`attachments`, Nodemailer'ın **e-postaya eklenecek dosyaları** aldığı alandır. Biz dosyayı diske kaydetmeden `content: Buffer` ile gönderebiliyoruz. Bu parametre isteğe bağlı olduğu için parola sıfırlama ve e-posta doğrulama çağrıları, dosya eki göndermeden önceki gibi çalışır.

50. bölümdeki `src/services/support.js` fonksiyonunu aşağıdaki **tam sürümle güncelleyin**; dosya hazırlanıp taranmadan ilk e-posta gönderilmeyecek:

```js
import { env } from "../config/env.js";
import { sendEmail } from "./email.js";
import { prepareSupportAttachment } from "./prepareSupportAttachment.js";

export const submitSupportRequest = async ({ user, message, file }) => {
  if (!env.supportEmailTo) {
    const error = new Error("Destek e-posta hizmeti şu anda kullanılamıyor.");
    error.status = 503;
    throw error;
  }

  const attachments = await prepareSupportAttachment(file);

  await sendEmail({
    to: env.supportEmailTo,
    replyTo: user.email,
    subject: "Movie API | Yeni yardım talebi",
    text: [
      "Yeni yardım talebi",
      `Kullanıcı kimliği: ${user._id}`,
      `Kayıtlı e-posta: ${user.email}`,
      "",
      "Kullanıcının mesajı:", message,
    ].join("\n"),
    attachments, // Sadece destek ekibine giden e-postada var.
  });

  try {
    await sendEmail({
      to: user.email,
      subject: "Movie API | Yardım talebiniz alındı",
      text: [
        "Merhaba,", "",
        "Yardım talebiniz alınmıştır. İnceleme gerektiğinde",
        "kayıtlı e-posta adresiniz üzerinden iletişime geçebiliriz.",
        "Bu otomatik bildirim, sorunun çözüldüğü anlamına gelmez.",
      ].join("\n"),
    });
  } catch (error) {
    console.error("Destek alındı e-postası gönderilemedi:", {
      code: error?.code ?? "unknown",
    });
  }
};
```

## Örnek 25

Aynı şekilde mevcut `src/controllers/support.js` içindeki fonksiyonun yalnızca **`file: req.file`** bilgisini de Service'e aktarması gerekiyor:

```js
import { submitSupportRequest } from "../services/support.js";

export const submitSupportRequestController = async (req, res) => {
  await submitSupportRequest({
    user: req.user,
    message: req.body.message,
    file: req.file, // Dosya yoksa undefined; bu geçerlidir.
  });
  res.status(200).json({
    message: "Yardım talebiniz e-posta hizmetine iletildi.",
  });
};
```

## Örnek 26

Son olarak `src/routers/support.js` dosyasında, doğrulamalardan **sonra fakat Controller'dan önce** Multer'ı çalıştırın. `src/server.js` içindeki `app.use("/support", supportRouter)` bağlantısını değiştirmiyoruz:

```js
import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { requireVerifiedEmail } from "../middlewares/requireVerifiedEmail.js";
import { validateBody } from "../middlewares/validateBody.js";
import { supportRateLimit } from "../middlewares/supportRateLimit.js";
import { uploadSupportAttachment } from "../middlewares/uploadSupportAttachment.js";
import { supportRequestSchema } from "../validation/support.js";
import { submitSupportRequestController } from "../controllers/support.js";

const router = Router();
router.post(
  "/requests",
  authenticate,
  requireVerifiedEmail,
  supportRateLimit,
  uploadSupportAttachment,
  validateBody(supportRequestSchema),
  submitSupportRequestController,
);
export default router;
```

## Örnek 27

**Neden bu sıra?** Kimliği doğrulanmayan veya saatteki talep sınırını aşan isteklerin dosyalarını belleğe almayız. Multer, dosya varsa `req.file` içine; formdaki `message` bilgisini de `req.body` içine koyar. `validateBody` mevcut Joi şemasındaki mesaj uzunluğunu denetler. `file` yoksa `prepareSupportAttachment()` boş dizi döndürür ve Service yalnız metni gönderir. Dosya varsa, taramadan geçmeden `sendEmail()` çağrılmaz.

Bu yola ayrıca 65. bölümde ele aldığımız **CSRF korumasının gerçek Router entegrasyonu** gerekir. Çerezli oturum açmış kullanıcının bilgisiyle başka bir sitenin istem dışı istek göndermesi engellenmelidir; bu örnek Router tek başına tamamlanmış bir CSRF savunması değildir.

### 5. Ada'nın denemesinde hangi sonuçları görmeliyiz?

İlk denemede Ada **dosya eklemeden** şu JSON'u gönderebilir; önceki yardım işlevi bozulmaz:

```http
POST /support/requests
Content-Type: application/json

{"message":"Profil fotoğrafımı güncellerken hata alıyorum."}
```

## Örnek 28

İkinci denemede Postman'de **Body → form-data** seçin. `message` alanını **Text**, `attachment` alanını **File** yapın. `Content-Type` başlığını elle yazmayın; Postman dosya parçalarını ayıran `boundary` bilgisini kendisi eklesin. Giriş çerezini ve CSRF koruması etkinse gerekli değeri de gönderin.

```text
POST /support/requests
message     (Text)  Profil fotoğrafımı güncellerken hata alıyorum.
attachment  (File)  hata-ekrani.png
```
