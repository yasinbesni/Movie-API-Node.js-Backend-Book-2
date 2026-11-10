# Bölüm 42 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

nı veritabanı sorgusunda buluşturacağız.

## `owner` Hangi Sahipliği Anlatıyor?

`owner`, *sahip* demektir; burada filmin telif hakkını veya onu izleyen kişiyi değil, **katalog kaydını ekleyen ve o kaydı yönetebilen kullanıcıyı** ifade eder.

Ada'nın *Arrival* kaydını oluşturduğu durumda:

- Katalog kaydı herkese görünür.
- Kaydın `owner` değeri Ada'nın kullanıcı kimliğidir.
- Normal kullanıcılar arasında güncelleme ve silme hakkı yalnız Ada'ya aittir.

Deniz de *Arrival* filmini kendi izleme listesine almak isteyebilir. Bu durumda Ada'nın Movie kaydının `owner` değeri değişmez; Deniz'in kişisel listesinde **başka bir kayıt** oluşur. İzleme listesini daha sonra kendi veri yapısıyla kuracağız.

Bu ayrımın devamını tek bir görüntü üzerinde düşünelim:

![Ortak film kaydının herkese açık görüntülenmesi ve yalnız sahibi tarafından güncellenmesi](../assets/diagrams/42-owner-sahiplik-koruma.svg)

Deniz'in aynı film kaydını görebilmesi beklenir. Onu değiştirememesi için ise görünürlük ayarı değil, **sorguya eklediğimiz sahiplik koşulu** gereklidir.

## Movie Modeline Sahiplik Bilgisini Ekleyelim

`src/db/models/movie.js` dosyasında `movieSchema` içindeki alanların yanına şu tanımı ekleyin:

```js
owner: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  index: true,
},
```

## Örnek 2

Bu alanı oluşturan üç parçayı mevcut kayıt üzerinden okuyalım: `ObjectId`, Ada'nın `User` belgesindeki kimliğin türünü; `ref: "User"`, bu kimliğin hangi modele ait olduğunu; `index: true` ise sahipliğe göre yapılan sorgular için indeks oluşturulacağını belirtir. **`ref`, kendi başına erişim izni denetlemez.** İzin kuralını birazdan sorguda uygulayacağız.

Burada bilerek `required: true` yazmadık. Çünkü veritabanındaki mevcut Movie kayıtlarında henüz `owner` bulunmuyor. Şemaya bugün zorunlu alan eklemek, eski belgeleri kendiliğinden güncellemez. Bu örnekte **yeni kayıtların sahipliğini oluşturma akışında belirleyeceğiz**; geçmiş kayıtları ayrı değerlendireceğiz. Bu, `owner` alanının veritabanı düzeyinde henüz zorunlu tutulduğu anlamına gelmiyor.

Ayrıca Movie modelindeki `title + releaseYear` benzersiz indeksi korunuyor. Dolayısıyla Ada ile Deniz aynı film için ayrı katalog kayıtları açamıyor. Kataloğun ortak kalmasıyla, kişisel izleme listelerinin ayrı tutulması birbiriyle çelişmiyor.

## Sahip Kimliğini Kim Belirlemeli?

Ada'nın istek gövdesine şunu eklediğini düşünelim:

```json
{
  "title": "Arrival",
  "releaseYear": 2016,
  "voteAverage": 7.9,
  "owner": "baska-bir-kullanicinin-id-degeri"
}
```

## Örnek 3

İstekte yazan `owner` değerini doğrudan kaydetseydik, Ada kendi kimliğiyle giriş yaptığı hâlde Deniz'i kaydın sahibi olarak gösterebilirdi. Böyle bir alanı istemcinin belirlemesine izin vermemeliyiz.

Bu nedenle iki kontrolü birlikte kullanıyoruz: Mevcut `createMovieSchema`, `owner` alanını kabul etmiyor; Service de sahipliği istek gövdesinden **okumuyor**. Sahip kimliği, JWT'yi doğrulayıp kullanıcıyı `req.user` içine yerleştiren `authenticate` aracılığıyla elde ediliyor.

`src/services/movies.js` dosyasındaki **mevcut** `createMovieService` fonksiyonunu şu sürümle değiştirin:

```js
export const createMovieService = async (payload, userId) => {
  const movie = new Movie({
    title: payload.title,
    releaseYear: payload.releaseYear,
    voteAverage: payload.voteAverage,
    owner: userId,
  });

  await movie.save();
  return movie;
};
```

## Örnek 4

`payload` film adı, çıkış yılı ve puan gibi kullanıcıdan gelen alanları taşır. `userId` ise sunucunun doğruladığı hesap kimliğidir. **`owner: userId` yazdığımızda, kaydın sahibini istemci değil sunucu belirler.**

`src/controllers/movies.js` içindeki mevcut `createMovie` fonksiyonunda yalnızca Service çağrısını güncelleyin:

```js
const movie = await createMovieService(
  req.body,
  req.user._id,
);
```

## Örnek 5

Bu satırda `req.body` film bilgilerini, `req.user._id` ise isteğin hangi doğrulanmış kullanıcıdan geldiğini taşır. Controller'ın mevcut `201 Created` yanıtını koruyoruz; yeni bir Controller oluşturmuyoruz.

Ada başarıyla film eklediğinde oluşan Movie kaydı artık Ada'ya bağlıdır. Fakat burada durursak Deniz'in eski güncelleme yolundan kayda erişmesini henüz engellemiş olmayız.

## Deniz Aynı Film Kimliğiyle Güncelleme İsterse?

Deniz, Ada'nın oluşturduğu kaydın `movieId` değerini biliyor. İstek gönderdiğinde **hem film kimliği hem de Deniz'in kullanıcı kimliği birlikte** aranmalı. Bunlardan biri uyuşmazsa güncelleme yapılmamalı.

`src/services/movies.js` içindeki mevcut güncelleme ve silme fonksiyonlarını şu sürümlerle değiştirin:

```js
export const updateMovieByIdService = async (
  movieId,
  userId,
  payload,
) => {
  return Movie.findOneAndUpdate(
    { _id: movieId, owner: userId },
    { $set: payload },
    { returnDocument: "after", runValidators: true },
  ).exec();
};

export const deleteMovieByIdService = async (
  movieId,
  userId,
) => {
  return Movie.findOneAndDelete({
    _id: movieId,
    owner: userId,
  }).exec();
};
```

## Örnek 6

`findOneAndUpdate()` içindeki filtre iki koşul içeriyor: `_id: movieId` ile hedef film; `owner: userId` ile o filmin sahibi kontrol ediliyor. Bu koşullar **aynı sorguda** yer alıyor.

Örneğin kayıt *Arrival*, sahibi Ada olsun:

| İsteği gönderen | Aranan koşul | Sonuç |
|---|---|---|
| Ada | Film kimliği doğru, `owner` Ada | Kayıt bulunur ve güncellenir. |
| Deniz | Film kimliği doğru, `owner` Deniz | Eşleşme yok; kayıt değişmez. |
| Ada | Film kimliği yanlış | Eşleşme yok; kayıt değişmez. |

Deniz'in isteğinde dönen `null`, **kaydın hiç bulunmamasıyla kaydın Deniz'e ait olmamasını** dışarıdan ayırt ettirmez. Mevcut Controller'ın `404 Not Found` davranışı bu nedenle uygundur. `404` yanıtı tek başına koruma değildir; koruma, veriyi değiştiren sorgunun sahibini de kontrol etmesidir.

`returnDocument: "after"`, başarılı güncellemeden **sonraki** belgeyi döndürür; `runValidators: true` ise güncellenen alanlar için Mongoose doğrulamalarını çalıştırır. Silme işlemindeki `findOneAndDelete()` de aynı sahiplik filtresini kullanır.

`src/controllers/movies.js` dosyasında mevcut Service çağrılarını değiştirin:

```js
// updateMovieById içindeki çağrı:
await updateMovieByIdService(movieId, req.user._id, req.body);

// deleteMovieById içindeki çağrı:
await deleteMovieByIdService(movieId, req.user._id);
```

## Örnek 7

Bu çağrılar, Controller'lardaki eski çağrıların **yerine** geçer. Geçersiz `movieId` kontrolü ile sonuç bulunamadığında verilen `404` yanıtı korunur.

Bir sınır daha önemli: `owner` alanını yalnız **arama filtresinde** korumak yeterli değildir; istemcinin güncelleme gövdesinden `owner` değerini değiştirerek sahipliği devralmasına da izin vermemeliyiz. Bu nedenle `src/validation/movieSchemas.js` içindeki create ve update Joi şemaları `owner` alanını kabul etmeyecek. Update Service'e geçen `payload` da yalnızca izin verdiğimiz film alanlarından oluşmalı. Buradaki iki savunma birbirini tamamlar: **Doğru kaydı bulmak ve yalnız izin verilen alanları değiştirmek.**

## Router İstekleri Doğru Sırayla Denetlemeli

Bu sorguların çalışması için `userId` değerinin güvenilir olması gerekiyor. O yüzden yazma işlemlerinde `authenticate` ara katmanını çalıştırıyoruz. `GET /movies` ve `GET /movies/:movieId` ise ortak katalog için herkese açık kalıyor.

`src/routers/movies.js` dosyasına şu import'u ekleyin:

```js
import { authenticate } from "../middlewares/authenticate.js";
```

## Örnek 8

Ardından mevcut yol tanımlarını güncelleyin:

Bu yol tanımlarını mevcut `src/routers/movies.js` dosyasında değiştirin. `authenticate` importu da aynı dosyada yer almalı; `/movies` Router’ını ikinci kez oluşturmuyoruz.

```js
router.get("/", getMovies);
router.get("/:movieId", getMovieById);

router.post("/", authenticate, validateBody(createMovieSchema), createMovie);
router.patch("/:movieId", authenticate, validateBody(updateMovieSchema), updateMovieById);
router.delete("/:movieId", authenticate, deleteMovieById);
```
