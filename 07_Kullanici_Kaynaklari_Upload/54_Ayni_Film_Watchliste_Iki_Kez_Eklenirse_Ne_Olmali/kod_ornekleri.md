# Bölüm 54 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

me Listesine İki Kez Eklenirse Ne Olmalı?


## Ada Aynı Filme İki Kez Basarsa Ne Olacak?

İzleme listesini kullanıcı ile film arasındaki ayrı kayıt olarak tasarladık. Ancak Ada'nın “Listeye ekle” düğmesine art arda basması veya ağın aynı isteği yinelemesi iki eş kayıt oluşturmamalı. **Önce kaydı sorgulamak tek başına yetmez.** Ada aynı anda telefondan ve bilgisayardan isteği gönderirse iki sorgu da henüz kayıt olmadığı sonucunu alabilir. Veritabanı ikinci kaydı engelleyecek ayrı bir kurala ihtiyaç duyar. Bu nedenle kullanıcı–film çiftini veritabanı düzeyinde benzersiz yapacağız.

## İzleme Listesinde Hangi Kuralı Koruyacağız?

Ada, *Interstellar*'ı izleme listesine eklemek için isteği gönderiyor. Bağlantı yavaşlayınca düğmeye bir daha basıyor. İki istek aynı anda ulaşırsa listesinde iki ayrı *Interstellar* kaydı görmemeli. Deniz ise aynı filmi kendi listesine eklemekte özgür olmalı.

İstediğimiz kural bu kadar basit: **Aynı kullanıcıyla aynı film bir kez eşleşir; farklı kullanıcılar aynı filmi kaydedebilir.** Bunu yalnızca butonu devre dışı bırakarak garanti edemeyiz. Sunucuya ulaşan iki isteğin sırasını her zaman kontrol edemediğimiz için kuralı veritabanında da korumamız gerekir.

```text
User A + Movie X
→ tek kayıt
```

## Örnek 2

Ama başka kullanıcı aynı Movie'yi kendi listesine ekleyebilmeli:

```text
User B + Movie X
→ ayrı kayıt
```

## Örnek 3

Bu nedenle `movieId` tek başına unique olamaz.

---

## Kullanıcı–Film İkilisini Neden Birlikte Benzersiz Tutuyoruz?

Birleşik benzersiz indeksi `src/db/models/watchlistItem.js` dosyasında, `watchlistItemSchema` tanımından **hemen sonra ve `WatchlistItem` modeli dışa aktarılmadan önce** ekleyin. Böylece 53. bölümde oluşturduğumuz model aynı kullanıcı–film çiftini ikinci kez kabul etmeyecek.

```js
watchlistItemSchema.index(
  { userId: 1, movieId: 1 },
  { unique: true },
);
```

## Örnek 4

Bu **birleşik benzersiz indeks**, `userId` ve `movieId` değerlerinin **aynı çift olarak** ikinci kez kaydedilmesini engeller:

```text
aynı userId
+
aynı movieId
```

## Örnek 5

Fakat farklı kullanıcıların aynı filmi eklemesine izin verir.

---

## Önce `findOne()` Yapmak Yetmez

Şu kod kullanıcı deneyimi için faydalı olabilir:

Bu sorgu, `src/services/watchlist.js` içindeki ekleme işlevinde karşılaşabileceğimiz yarış durumunu açıklayan bir örnektir; tek başına benzersizlik garantisi yerine geçmez.

```js
const existing = await WatchlistItem.findOne({
  userId,
  movieId,
});

if (existing) {
  throwConflict();
}
```

## Örnek 6

Peki iki istek neredeyse aynı anda gelirse?

```text
A existing bulamaz
B existing bulamaz
A create
B create
```

## Örnek 7

isayarından gelen istekler aynı anda ilerleyebilir. Ön kontrolü ikisi de geçse bile birleşik benzersiz indeks ikinci kaydı engeller. Şimdi, **veritabanının engellediği bu isteğe nasıl anlaşılır bir HTTP yanıtı döneceğimize** bakalım.

## Yinelenen Kayıt Hatasını Anlaşılır Bir Yanıta Çevirelim

MongoDB, aynı kullanıcı–film ikilisini ikinci kez eklemeye çalıştığımızda `E11000` (**yinelenen anahtar**) hatası üretebilir. Ada'nın bu kodu görmesine gerek yoktur; ona **“Bu film izleme listenizde zaten var.”** mesajıyla `409 Conflict` yanıtı döndürmeliyiz.

Bu dönüşümü birazdan `src/controllers/watchlist.js` içinde göstereceğiz. Service veritabanı kaydını oluşturmayı dener; Controller yalnızca **bu özel hata türünü** kullanıcıya anlaşılır bir yanıta dönüştürür. Diğer hatalar merkezi hata yöneticisine aktarılır. Böylece aynı hata kontrolünü Service, Controller ve ortak hata yöneticisine üç kez kopyalamayız.

---

## Ada Aynı İsteği Tekrar Gönderirse Ne Yanıt Vereceğiz?

Ada'nın filmi listesine ekleme isteği iki kez ulaşırsa **veritabanında yine tek kayıt** bulunmalıdır. Yanıtı nasıl vereceğimiz ise API'nin seçtiği kurala bağlıdır. İki yaygın tercih var.

İkinci eklemeyi hata sayan yaklaşım:

```text
ilk POST → 201
ikinci POST → 409
```

## Örnek 8

Tekrarlanan isteği mevcut kayıtla karşılayan yaklaşım:

```text
ilk POST → 201
ikinci POST → mevcut kaydı 200 ile döndür
```

## Örnek 9

Bir isteği tekrar göndermek, ilk başarılı işlemden sonra sistemde **ek bir değişiklik oluşturmuyorsa**, buna *idempotent davranış* denir. `POST` istekleri kendiliğinden böyle davranmak zorunda değildir; bir API bu özelliği özellikle tasarlayabilir. İkinci isteğe `200` dönmek bir seçenek olsa da **biz Movie API’de önceden eklenmiş filmi yeniden eklemeye `409 Conflict` döndüreceğiz**. Ada böylece “sunucu isteği işleyemedi” gibi belirsiz bir uyarı yerine, “Bu film zaten izleme listenizde” mesajını görebilir. Böylece istemci, filmin zaten listede olduğunu açıkça anlayacak.

---

## `$addToSet` Kullansaydık?

Watchlist User document'ında array olsaydı:

```js
$addToSet: { watchlist: movieId }
```

## Örnek 10

Yalnızca geliştirme ortamında çalışmasına güvenmek yeterli değildir.

---

## Ön Kontrol ile Veritabanı Güvencesi Neden Farklıdır?

`findOne()` ile kaydı önceden kontrol etmek, Ada'ya anlaşılır bir `409` yanıtı vermemizi sağlar. Ancak iki istek aynı anda gelip ikisi de “kayıt yok” sonucunu alabilir. İşte bu yüzden **asıl güvence veritabanındaki birleşik benzersiz indekstir**: Aynı kullanıcı–film çiftinden ikinci bir kayıt oluşmasına izin vermez. Service katmanı kullanıcıya uygun hata mesajını hazırlar; veritabanı ise iki isteğin çakıştığı anda da aynı kuralı korur. Benzersiz indeksin ürettiği yinelenen kayıt hatasını `409` yanıtına dönüştürerek iki katmanı tutarlı çalıştırırız.

---

## İzleme Listesi İsteklerini HTTP Üzerinden Kullanalım

53. bölümde izleme listesi için üç Service işlevi yazdık. Şimdi bunları Ada’nın gerçekten HTTP isteğiyle kullanabilmesi için Controller ve Router’a bağlayalım. **Service veritabanı işini yapar; Controller gelen istekteki parametreleri kontrol eder ve HTTP yanıtını oluşturur.** Kullanıcı kimliğini yine `req.body` içinden değil, `authenticate` tarafından doğrulanmış `req.user._id` değerinden alacağız.

Yeni dosya **`src/controllers/watchlist.js`**:

```js
import { isValidObjectId } from "mongoose";
import {
  addToWatchlist,
  getMyWatchlist,
  removeFromWatchlist,
} from "../services/watchlist.js";

const badRequest = (message) => {
  const error = new Error(message);
  error.status = 400;
  return error;
};

const requireMovieId = (movieId) => {
  if (!isValidObjectId(movieId)) {
    throw badRequest("Geçerli bir film kimliği gönderin.");
  }
  return movieId;
};

export const addWatchlistItem = async (req, res) => {
  const movieId = requireMovieId(req.params.movieId);
  try {
    const item = await addToWatchlist(req.user._id, movieId);
    return res.status(201).json({ data: item });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "Bu film izleme listenizde zaten var.",
      });
    }
    throw error;
  }
};

export const listMyWatchlist = async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  if (!Number.isSafeInteger(page) || page < 1 ||
      !Number.isSafeInteger(limit) || limit < 1 || limit > 50) {
    throw badRequest("Sayfa ve kayıt sayısı geçersiz.");
  }
  const result = await getMyWatchlist(req.user._id, { page, limit });
  return res.status(200).json({ data: result.items, total: result.total });
};

export const deleteWatchlistItem = async (req, res) => {
  const movieId = requireMovieId(req.params.movieId);
  const item = await removeFromWatchlist(req.user._id, movieId);
  if (!item) {
    const error = new Error("İzleme listesi kaydı bulunamadı.");
    error.status = 404;
    throw error;
  }
  return res.status(204).send();
};
```

## Örnek 11

`isValidObjectId()` kimliğin MongoDB’de kullanılan ObjectId biçiminde olup olmadığını kontrol eder; **filmin gerçekten var olduğunu kanıtlamaz**. Film bulunamadığında Service `404` döndürür. Aynı kayıt ikinci kez oluşturulmak istendiğinde, benzersiz indeksin ürettiği `11000` hatasını Controller’da `409` yanıtına çeviriyoruz. Buradaki `try/catch` yalnızca hatayı `next(error)` ile taşımak için değil, **özel olarak bu hata türünü anlamlı bir yanıta dönüştürmek için** var; diğer asenkron hatalar Express 5’in merkezi hata zincirine gider.

Yeni dosya **`src/routers/watchlist.js`**:

```js
import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import {
  addWatchlistItem,
  listMyWatchlist,
  deleteWatchlistItem,
} from "../controllers/watchlist.js";

const router = Router();
router.get("/", authenticate, listMyWatchlist);
router.post("/:movieId", authenticate, addWatchlistItem);
router.delete("/:movieId", authenticate, deleteWatchlistItem);
export default router;
```

## Örnek 12

Son olarak mevcut **`src/server.js`** dosyasında, diğer Router importlarıyla birlikte bu modülü alın ve hata yöneticisinden önce bağlayın:

```js
import watchlistRouter from "./routers/watchlist.js";

app.use("/watchlist", watchlistRouter);
```
