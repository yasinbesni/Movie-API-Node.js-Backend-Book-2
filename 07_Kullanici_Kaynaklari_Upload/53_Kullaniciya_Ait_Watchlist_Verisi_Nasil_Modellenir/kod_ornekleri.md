# Bölüm 53 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

t) Nasıl Modelleriz?


## Ada'nın İzleme Listesi Film Kaydından Nasıl Ayrılır?

Ada'nın profil bilgilerini güvenli biçimde güncelleyebiliyoruz; şimdi hesabıyla ilişkilendireceğimiz ilk kişisel film verisine geçelim. Ada *Interstellar*'ı listesine eklediğinde katalogdaki film herkes için aynı kalır; **değişen, Ada ile o film arasındaki kayıtlı ilişkidir.** Deniz de aynı filmi kendi listesine ekleyebilir. Bu nedenle liste üyeliğini film belgesinin kendisinden ayrı modelleyeceğiz.

## Bir Film, Birden Fazla Kişinin Listesinde Olabilir

Bir filmi listesine kaydetmek, onu ortak kataloğa yeniden eklemek değildir.

Burada önemli bir ayrım var: 43. bölümde Ada'nın **kataloğa kendi eklediği filmleri** listelemiştik. Oysa izleme listesi (*watchlist*), filmi kataloğa kimin eklediğinden bağımsızdır. Ada, Deniz'in kataloğa eklediği ve herkesin erişebildiği bir filmi de kendi izleme listesine alabilmeli. Böylece aynı film kaydı iki kişinin kişisel listesinde yer alabilir; film verisini iki kez kopyalamamız gerekmez.

Bu kayıtta yan yana duran iki kimlik vardır: **Ada’nın kullanıcı kimliği** ve **eklediği filmin kimliği**. İkisini birlikte okumak, “Bu filmi kim listesine aldı?” sorusunu cevaplar:

```text
User
↕
Movie
```

## Örnek 2

İlk akla gelen çözüm, Ada'nın izleme listesini doğrudan `User` belgesinin içinde tutmak olabilir. Bunun için kullanıcıya ait film kimliklerini bir dizide saklarız:

```js
watchlist: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
  },
]
```

## Örnek 3

aha karmaşık hâle gelebilir.

Bu yüzden başka bir yol seçiyoruz: **Her "kullanıcı bu filmi listesine ekledi" işlemini ayrı bir `WatchlistItem` kaydıyla temsil edeceğiz.** Örneğin *Interstellar* için Ada'ya ait bir kayıt, Deniz de aynı filmi eklediğinde Deniz'e ait ikinci bir kayıt oluşur. Ortak `Movie` belgesini çoğaltmayız. Her liste kaydı kendisini oluşturan kullanıcıyı, ilgili filmi ve ekleme zamanını taşır.

Bu tasarımın bir bedeli de var. Ada listesini açtığında `WatchlistItem` kaydı bize yalnızca **hangi filmi kaydettiğini** söyler; filmin adını veya posterini söylemez. Önce Ada'nın liste kayıtlarını okur, sonra bu kayıtlarda işaret edilen `Movie` belgelerindeki film bilgilerini getiririz. Mongoose'un `.populate("movieId")` yöntemi, kimliklerle kurulan bu bağlantıyı bizim için tamamlar; gerekirse ek veritabanı sorguları yürütür. Böylece **biraz daha fazla veri okuma işi** karşılığında filmleri çoğaltmadan, kişisel listeyi bağımsız yönetebiliriz.

---

## Neden `WatchlistItem` Seçiyoruz?

Yeni `src/db/models/watchlistItem.js` dosyasını oluşturun. İlk adımda **tam bir model dosyası** yazıyoruz; 54. bölümde aynı dosyaya kullanıcı–film çiftini benzersiz tutan indeksi ekleyeceğiz:

```js
import mongoose from "mongoose";

const watchlistItemSchema = new mongoose.Schema(
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
  },
  { timestamps: true },
);

export const WatchlistItem =
  mongoose.models.WatchlistItem ||
  mongoose.model("WatchlistItem", watchlistItemSchema);
```

## Örnek 4

Her `WatchlistItem` belgesi tek bir kullanıcı–film ilişkisini temsil eder:

```text
User A, Movie X'i watchlist'ine ekledi.
```

## Örnek 5

 gerekir. `populate` bu iki veri grubunu bir araya getirmemize yardımcı olur.

Bu tercih listeleme kodunu da belirliyor. `WatchlistItem.find({ userId })` önce Ada'nın kayıtlarını getirir; `.populate("movieId")` bu kayıtlardaki film kimliklerini ilişkili `Movie` bilgileriyle tamamlar. `countDocuments({ userId })` ise sayfalama için kaç kayıt olduğunu hesaplar. Yani **kullanıcının hangi filmi kaydettiği** ile **filmin katalog bilgileri** iki ayrı yerde tutulur ve ihtiyaç olduğunda birlikte okunur. Bu sorgu ve indekslerin bakımını da üstleniriz; ayrı model her koşulda en hızlı ya da en basit çözüm değildir.

---

*Interstellar* tek bir film kaydı olarak kalır; Ada'nın listesinde bulunması ve Deniz'in listesinde bulunması iki ayrı **kullanıcı–film ilişkisi** doğurur. Film adını ve süresini bu iki liste kaydına kopyalarsak film bilgisi değiştiğinde hangi kopyayı güncelleyeceğimiz sorunu çıkar. `WatchlistItem` ilişkiyi ayrı tuttuğunda `Movie` ortak katalog bilgisi, liste kaydı ise **kullanıcıya özel tercih** olur. Bu ayrım yalnız düzeni güzelleştirmek için değil, hangi verinin kime ait olduğunu karıştırmamak içindir.

## İzleme Listesi İçin Hangi HTTP Yollarına İhtiyacımız Var?

Eklemek:

```http
POST /watchlist/:movieId
```

## Örnek 6

Listelemek:

```http
GET /watchlist
```

## Örnek 7

Silmek:

```http
DELETE /watchlist/:movieId
```

## Örnek 8

Bu üç adres, Ada’nın ekleme, listeleme ve silme isteklerine karşılık gelir. **Bu bölümde veri modelini ve Service işlevlerini hazırlıyoruz; 54. bölümde benzersizlik kuralını ekledikten sonra Router ve Controller bağlantılarını kurup bu adresleri HTTP üzerinden deneyeceğiz.** Bu sıralama sayesinde okur, uygulamadığımız bir yolu çalışıyormuş gibi görmeyecek.

Ada kendi listesini açarken URL'ye kullanıcı kimliğini yazmasına gerek yoktur. Movie API, giriş sırasında doğruladığı hesabı şu alandan tanır:

```js
req.user._id
```

## Örnek 9

Böylece Deniz URL'ye Ada'nın kimliğini yazarak onun listesini isteyemez.

---

## Add Service

Aşağıdaki Service işlevlerini yeni `src/services/watchlist.js` dosyasında toplayacağız. Model importlarını dosyanın başına ekleyin; `Movie` importunun mevcut proje modelinizdeki dışa aktarma adıyla eşleştiğini kontrol edin. **Bu bölümdeki Service fonksiyonları kendi başlarına HTTP yolu açmaz; bunları 54. bölümde Router’a bağlayacağız.**

```js
import { WatchlistItem } from "../db/models/watchlistItem.js";
import { Movie } from "../db/models/movie.js";

export const addToWatchlist = async (
  userId,
  movieId,
) => {
  const movieExists = await Movie.exists({
    _id: movieId,
  });

  if (!movieExists) {
    const error = new Error("Film bulunamadı.");
    error.status = 404;
    throw error;
  }

  return WatchlistItem.create({
    userId,
    movieId,
  });
};
```

## Örnek 10

Bu işlem film kaydının `owner` değerini değiştirmez. Ada, kataloğa Deniz'in eklediği erişilebilir bir filmi de **kendi izleme listesine** alabilir. `WatchlistItem.userId`, filmi kataloğa kimin eklediğini değil, listeye kimin kaydettiğini gösterir.

---

## Listeleme

Listeleme işlevini de `src/services/watchlist.js` dosyasına, `addToWatchlist` işlevinin yanına ekleyin.

```js
export const getMyWatchlist = async (
  userId,
  { page = 1, limit = 20 },
) => {
  const skip = (page - 1) * limit;

  const filter = { userId };

  const [items, total] = await Promise.all([
    WatchlistItem.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("movieId"),
    WatchlistItem.countDocuments(filter),
  ]);

  return { items, total };
};
```

## Örnek 11

Listeleme sorgusuyla toplam kayıt sayısını hesaplayan sorgu aynı `{ userId }` filtresini kullanıyor. Böylece Ada sayfa sayfa kendi listesini görürken `total` değeri yanlışlıkla Deniz'in kayıtlarını da saymıyor.

---

## Silme

Silme işlevinin yeri yine `src/services/watchlist.js` dosyasıdır. Üç işlem aynı izleme listesi sorumluluğunu paylaşır.

```js
export const removeFromWatchlist = async (
  userId,
  movieId,
) => {
  return WatchlistItem.findOneAndDelete({
    userId,
    movieId,
  });
};
```
