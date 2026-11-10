# Bölüm 55 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# Yorum ve Puanları Film Kaydında mı, Ayrı Kayıtlarda mı Tutmalıyız?


## Listeye Eklemekle Yorum Yazmak Aynı Veri midir?

Aynı filmin Ada'nın izleme listesinde bir kez bulunmasını sağladık. Ada filmi izledikten sonra puan ve yorum eklemek istediğinde ise bambaşka bir kayıt türü oluşur: Yorumun içeriği, tarihi ve güncellenme davranışı vardır. **Bu bilgiyi Movie belgesine mi gömelim, yoksa filmle ilişkili ayrı Review kayıtları mı tutalım?** Kararı sorgu ve büyüme ihtiyaçlarına göre vereceğiz.

## Bir Film Binlerce Review Alabilir

Ada bir filmi listesine kaydettiğinde bu karar yalnızca ona aitti. Şimdi filmi izlediğini ve kısa bir yorum bıraktığını düşünelim. Deniz de aynı filme farklı bir puan vermek istiyor. Film ortak, fakat yorumlar ayrı kullanıcıların oluşturduğu ve zamanla çoğalabilecek kayıtlar.

Bu yeni yorum (review) ve puan (rating) kayıtlarını tasarlarken izleme listesinde öğrendiğimiz soru yeniden karşımıza çıkıyor: İlişkili veriyi ana belgenin içine mi yerleştireceğiz, yoksa ayrı bir koleksiyonda mı tutacağız? Bu kez kararımızı bir filmin zaman içinde alabileceği yorum sayısı belirleyecek. İlk akla gelen tasarıma bakalım:

```js
const movieSchema = new mongoose.Schema({
  title: String,
  reviews: [
    {
      userId: ObjectId,
      rating: Number,
      text: String,
    },
  ],
});
```

## Örnek 2

Veriyi **Movie belgesinin içine yerleştirmek** (*embedded*), bütün yorumları film kaydındaki bir diziye yazmak demektir. Yorum sayısı az ve sabitse bu sade olabilir. Ancak Ada, Deniz ve yüzlerce kişi *Interstellar* hakkında yorum yazdığında aynı film kaydı sürekli büyür. Biz **ayrı yorum kayıtları** (*referenced*) seçiyoruz: Her yorum kendi belgesinde durur, `movieId` ile filme bağlanır. Böylece bir yorumu silmek veya belirli kullanıcının yorumlarını listelemek için filmin bütün yorum dizisini taşımamız gerekmez.

---

## Yorumları Neden Ayrı Kayıtlarda Tutuyoruz?

Yorumları `src/db/models/review.js` dosyasında tanımlıyoruz. Aşağıdaki şema her yorumun hangi bilgileri taşıyacağını gösterir. Bu modelin diğer dosyalarda da kullanılabilmesi için `mongoose` paketini içeri alıp şemanın altından `Review` modelini dışa aktarmamız gerekir.

```js
const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
  },
  { timestamps: true },
);
```

## Örnek 3

Her yorumun artık kendi `userId`, `movieId`, `rating` ve `createdAt` değerleri var. Böylece Ada'nın yorumunu Deniz'inkinden ayırabilir, belirli bir filmin yorumlarını ayrıca listeleyebiliriz. Bu şema veriyi nasıl saklayacağımızı belirler; HTTP üzerinden yorum gönderme yolunu ayrıca bağlamak gerekir.

---

## Bir Kullanıcı Bir Filme Kaç Review Yazabilir?

Uygulamamızın kullanıcıya sunduğu kural:

```text
bir user + bir movie
→ en fazla bir review
```

## Örnek 4

ise compound unique index ekleyebiliriz:

Bu indeks, `src/db/models/review.js` dosyasında `reviewSchema` tanımının hemen altına eklenir; bağımsız bir JavaScript dosyası açılmaz.

```js
reviewSchema.index(
  { userId: 1, movieId: 1 },
  { unique: true },
);
```

## Örnek 5

Aynı dosyanın başında `import mongoose from "mongoose";` bulunur. Şema ve indeks tanımından sonra modeli **`export const Review = mongoose.model("Review", reviewSchema);`** ile dışa aktarırız. Böylece aşağıdaki Service kodu `Review` modelini bu dosyadan içeri alabilir. Bu indeks sayesinde aynı kişinin aynı filme ikinci kez yorum ekleme girişimi veritabanında reddedilir.

---

## Create Sırasında User ID Body'den Gelmez

Request:

```json
{
  "rating": 9,
  "text": "Görsel anlatımı çok güçlüydü."
}
```

## Örnek 6

Route:

```http
POST /movies/:movieId/reviews
```

## Örnek 7

Service:

Bu, `src/services/reviews.js` içinde kullanacağımız kayıt oluşturma işleminin çekirdeğidir. `req.user` ve `req.params` değerlerini Controller okur; Service'e doğrulanmış `userId`, `movieId`, `rating` ve `text` parametrelerini gönderir. İstek doğrulaması ve hata yanıtları ayrıca bağlanmalıdır.

```js
return Review.create({
  userId,
  movieId,
  rating,
  text,
});
```

## Örnek 8

nın değerlendirme sayısına bölünmesiyle bulunur: `16 / 2 = 8`. Önemli nokta şu: Bu sonucu hesaplamak için yalnızca *Interstellar* filmine ait yorumlara bakmalıyız; başka bir filmin puanlarını hesaba katamayız.

### Birinci yöntem: Puanları gerektiğinde hesaplamak

MongoDB'deki `Review` koleksiyonu, yorumların saklandığı yerdir. Buradan yalnızca istediğimiz filmin yorumlarını seçip ortalamasını bulabiliriz. MongoDB'nin **aggregation** özelliği, kayıtları art arda uygulanan işlemlerden geçirerek böyle bir sonuç üretir. Bu işlem sırasına *aggregation pipeline* denir.

Ada'nın örneğinde adımlar şunlardır:

1. **`$match`:** `movieId` değeri *Interstellar* filmine ait olan kayıtları seçer. Böylece başka filmlerin yorumları hesaplamaya karışmaz.
2. **`$group`:** Seçilen kayıtları aynı film için bir araya getirir. İçinde kullandığımız **`$avg: "$rating"`**, bu kayıtların `rating` değerlerinden ortalamayı hesaplar.
3. **`$sum: 1`:** Seçilen her yorum için sayacı bir artırır; böylece toplam kaç kişinin puan verdiğini de öğreniriz.

Bu adımların `src/services/reviews.js` dosyasındaki karşılığı şöyle olabilir. Buradaki `Review`, `src/db/models/review.js` dosyasından dışa aktardığımız modeldir:

```js
import mongoose from "mongoose";
import { Review } from "../db/models/review.js";

export const getMovieRatingStats = async (movieId) => {
  if (!mongoose.isObjectIdOrHexString(movieId)) {
    const error = new Error("Geçersiz film kimliği.");
    error.status = 400;
    throw error;
  }

  const [result] = await Review.aggregate([
    { $match: { movieId: new mongoose.Types.ObjectId(movieId) } },
    {
      $group: {
        _id: "$movieId",
        ratingAverage: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  return result
    ? { ratingAverage: result.ratingAverage, ratingCount: result.ratingCount }
    : { ratingAverage: null, ratingCount: 0 };
};
```

## Örnek 9

Örnekteki iki yorum için elde ettiğimiz sonuç şudur:

```json
{
  "ratingAverage": 8,
  "ratingCount": 2
}
```

## Örnek 10

 sayfalanmayacağını biliyor olsaydık yorumları `Movie` belgesindeki bir diziye yerleştirmek de makul olabilirdi.

Bizim uygulamada ise aynı filmi birçok kişi değerlendirebilir. Ada'nın kendi yorumlarını bulmak, Deniz'in yorumunu güncellemek veya uygunsuz bir yorumu incelemek istediğimizde **her yorumun kendi kaydı olması** işimizi kolaylaştırır. Bu nedenle `Review` koleksiyonuyla devam ediyoruz. “Embedded” ve “referenced” adları arasında ezber yapılacak bir üstünlük yok; veriyi nasıl kullanacağımız belirleyicidir.

## Ada Yalnızca Kendi Yorumunu Nasıl Değiştirir?

Ada'nın yorumunu düzenlediğini düşünelim. İstekle birlikte yorumun kimliği gelir; giriş sırasında doğruladığımız kullanıcının kimliği de elimizdedir. Güncelleme sorgusunda **iki şartı birlikte ararız:** Yorumun kimliği doğru olacak ve `userId` Ada'ya ait olacak. Deniz aynı yorum kimliğini bilse bile kendi hesabıyla Ada'nın yorumunu güncelleyememelidir.

`src/services/reviews.js` dosyasındaki işlem şu mantıkla kurulabilir. `reviewId` ve doğrulanmış `userId` Controller'dan Service'e aktarılır. `changes` ise Joi gibi bir doğrulama katmanından geçirilmiş, **yalnızca `rating` ve `text` alanlarını** içeren güncelleme verisidir:

```js
return Review.findOneAndUpdate(
  { _id: reviewId, userId },
  { $set: changes },
  { returnDocument: "after", runValidators: true },
);
```
