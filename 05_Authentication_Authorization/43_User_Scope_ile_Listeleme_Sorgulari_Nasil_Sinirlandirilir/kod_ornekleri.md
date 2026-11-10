# Bölüm 43 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# Kullanıcı Kapsamı (User Scope) ile Listeleme Sorgularını Nasıl Sınırlandırırız?


## Tek Kaydı Korumak Listeyi de Korur mu?

Movie belgelerine `owner` ekledik ve başka kullanıcının film kaydını değiştirmesini engelledik. Fakat Ada `GET /users/me/movies` istediğinde sorgu bütün kayıtları getirirse Deniz'in filmleri yanıt içinde yine görünebilir. **Bu kez tek bir kayıt üzerindeki değişiklik hakkını değil, listenin tamamının kullanıcıya göre daraltılmasını** sağlayacağız. Filtre, tarayıcıda değil sunucu tarafındaki MongoDB sorgusunda uygulanmalı.

## Ada Kendi Eklediği Filmleri Görmek İstiyor

42. bölümde Ada'nın Movie kaydını oluştururken `owner` alanını doldurduk. Başka bir kullanıcı Ada'nın kaydını değiştiremiyor. Fakat Ada şimdi şöyle soruyor: “Kataloğa benim eklediğim filmleri ayrı bir yerde görebilir miyim?”

`GET /movies` en başından beri bütün ziyaretçilerin erişebildiği **ortak film kataloğu**. Onu yalnızca Ada’nın filmlerini döndüren bir yola çevirirsek uygulamanın mevcut davranışını bozmuş oluruz.

İki farklı yol kullanacağız:

```http
GET /movies
GET /users/me/movies
```

## Örnek 2

İlki katalogda erişilebilir filmleri listeler. İkincisi yalnızca **giriş yapan kullanıcının kataloğa eklediği** Movie kayıtlarını getirir. Bu ikinci yol henüz kişisel izleme listesi (*watchlist*) değil; izleme listesini 53. bölümde ayrıca oluşturacağız.

## Veriyi Sorgularken Sahibi Unutmayalım

`src/services/movies.js` içine, mevcut `getMoviesService` fonksiyonunu **değiştirmeden** yeni fonksiyonu ekleyin:

```js
export const getMyMoviesService = async (userId, query) => {
  const { page, limit } = parsePaginationParams(query);
  const filter = { owner: userId };
  const skip = (page - 1) * limit;

  const [totalItems, movies] = await Promise.all([
    Movie.countDocuments(filter).exec(),
    Movie.find(filter)
      .forMovieList()
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
  ]);

  const pagination = calculatePaginationData(totalItems, limit, page);

  return {
    movies,
    meta: { page, limit, totalItems, ...pagination },
  };
};
```

## Örnek 3

Buradaki `Movie`, `parsePaginationParams` ve `calculatePaginationData` import'ları bu dosyada zaten bulunuyor; yeniden eklemeyin.

Sorgunun en önemli satırı şu:

```js
const filter = { owner: userId };
```

## Örnek 4

**Filmleri getirirken de toplam sayıyı hesaplarken de aynı filtreyi** kullanıyoruz. Aksi hâlde Ada'nın listesi yalnız kendisine ait kayıtları gösterirken sayfa bilgisi bütün katalogdaki kayıt sayısını söyleyebilir.

Ada'nın tek bir film kaydını değiştirmesi korumalı olsa bile liste sorgusu yanlışlıkla `Movie.find({})` yaparsa Deniz'in kayıtları yanıtın içine girebilir. Ekranda sonradan filtrelemek güvenli değildir; veri bir kez istemciye gönderildiğinde görünürlük sınırı aşılmıştır. **Sahiplik filtresi veritabanı sorgusunun içinde** bulunmalıdır. Sayfalama ve sıralama da bu filtre uygulanmış kümenin üzerinde yapılırsa toplam kayıt sayısı bile diğer kullanıcıların özel verilerini ele vermez.

## Controller ve Router'ı Bağlayalım

`src/controllers/movies.js` dosyasının mevcut Service import listesine `getMyMoviesService` adını ekleyin. Aynı dosyaya şu Controller'ı ekleyin:

```js
export const getMyMovies = async (req, res) => {
  const { movies, meta } = await getMyMoviesService(
    req.user._id,
    req.query,
  );

  return res.status(200).json({
    message: "Eklediğiniz filmler getirildi.",
    data: movies,
    meta,
  });
};
```

## Örnek 5

35. bölümde oluşturduğumuz `src/routers/users.js` dosyası zaten `/users` altında kullanılıyor. Onun import'larına şu Controller'ı ekleyin:

```js
import { getMyMovies } from "../controllers/movies.js";
```

## Örnek 6

Aynı Router'da mevcut `GET /me` yolunu koruyarak yeni yolu ekleyin:

```js
router.get("/me/movies", authenticate, getMyMovies);
```

## Örnek 7

`authenticate`, istekten Ada'nın kimliğini bulduktan sonra `req.user._id` değerini sağlar. Kullanıcı bu kimliği sorgu parametresinden seçmiyor.

## Ya Ada Başka Bir Owner Gönderirse?

Ada'nın tarayıcısından şöyle bir istek gelmiş olsun:

```http
GET /users/me/movies?owner=deniz-id&page=1
```

## Örnek 8

Bizim `getMyMoviesService` fonksiyonumuz `req.query.owner` alanına bakmıyor. Yalnızca güvenilir `userId` ile filtre kuruyor. Kullanıcı query parametresine (sorgu parametresine) başka bir kimlik yazsa da kapsam değişmiyor.

Şu yaklaşım ise tehlikeli olurdu:

```js
const filter = { owner: userId, ...req.query };
```

## Örnek 9

İstemciden gelen `owner`, güvenilir alanı ezebilir. Üstelik `page` gibi filtre olmayan parametreler de yanlışlıkla veritabanı sorgusuna karışabilir. **Yalnızca izin verilen sorgu alanlarını açıkça işlemek** daha güvenlidir.

## Filtreleme ve Sayfalama İleride Büyürse

Şimdilik bu kişisel endpoint'te yalnız `page` ve `limit` kullanıyoruz; Movie modelinde bulunmayan `genre` alanını varmış gibi sorgulamıyoruz. Daha sonra yıl veya ad filtresi eklenecekse bunu Joi ile doğrulayıp aynı `filter` nesnesine dahil etmeliyiz.

Katalog ve kullanıcı listesi ayrı kaldı:

```text
GET /movies
  → herkesin görebildiği film kataloğu

GET /users/me/movies
  → owner = doğrulanmış kullanıcı
  → aynı owner filtresiyle liste ve toplam sayı
```
