# Bölüm 66 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

eğin aynı anda yürütülmesi** ayrı bir sorun yaratabilir. Ada aynı filmi iki sekmede listesine eklerse her iki istek de önce “kayıt yok” sonucunu görebilir. Benzersiz indeks ve atomik güncellemenin hangi farklı hataları önlediğini burada ayıracağız.

## Kod Sırayla Yazılmış Olsa da İstekler Birbirine Karışabilir

Ada, *Interstellar*'ı listesine eklemek için düğmeye bastı; ağ gecikince aynı işlemi bir daha gönderdi. 54. bölümde aynı kullanıcı–film eşleşmesini korumak için birleşik benzersiz indeks (*compound unique index*) eklemiştik. Peki iki istek neredeyse aynı anda gelirse yazdığımız `if` kontrolü hangi sırayla çalışır?

Kod satırlarını sırayla okumamız, sunucudaki isteklerin sırayla tamamlanacağı anlamına gelmez. Bunu somut bir yarış durumu (*race condition*) üzerinden ele alacağız. Benzersiz indeksin çözdüğü problemi de çözmediği problemlerden ayıracağız.

İzleme listesi için kuralımız şu: **Aynı kullanıcı aynı filmi listesine ikinci kez ekleyemesin.** Bunu önce Service içinde “kayıt var mı?” kontrolü yaparak çözmeye çalışalım.

Service:

Bu örnek, `src/services/watchlist.js` içinde kayıt eklemeden önce yapılan kontrolün sınırını gösterir; aynı kontrolü ikinci kez kopyalamayın.

```js
const existing = await WatchlistItem.findOne({
  userId,
  movieId,
});

if (!existing) {
  await WatchlistItem.create({
    userId,
    movieId,
  });
}
```

## Örnek 2

Tek bir istek gönderdiğimizde bu kod işe yarıyor gibi görünür: Kayıt yoksa oluşturur. Ancak Ada ağ yavaşladı diye iki kez tıkladığında **birinci istek henüz yazmayı bitirmeden ikinci istek de sorgu yapabilir**.

---

## İki İsteğin Birbirinin Sonucunu Görmediği An

```text
Request A: findOne → yok
Request B: findOne → yok
Request A: create
Request B: create
```

## Örnek 3

Ada’nın telefonuyla bilgisayarı kayıtları aynı anda kontrol ettiğinde ikisi de “film listede yok” sonucunu alabilir. Birinci istek filmi eklediğinde ikinci isteğin az önce gördüğü bilgi **eskimiş olur**. Kontrol ile kayıt arasına başka bir işlemin girmesine **yarış durumu (race condition)** denir. Sorun tek bir JavaScript fonksiyonunun sırasından değil, iki ayrı isteğin eşzamanlı ilerlemesinden doğar.

---

Bu dört adımda bir hata oluştuğuna dikkat edin: A ve B, ikisi de henüz hiçbir kayıt oluşturulmadığı için “yok” sonucunu görüyor. Kontrol anından sonra durum değişse de ikinci istek bundan habersiz ilerliyor. İşte **yarış durumu (race condition)** budur.

## Benzersiz İndeks Hangi Sorunu Çözer?

Bunu yalnız Service içindeki `if` koşuluyla önleyemeyiz. Veritabanına aynı **kullanıcı–film ikilisinin** ikinci kez yazılmasına izin vermeyen bir kural koyabiliriz. Bu kurala **birleşik benzersiz indeks (compound unique index)** denir:

```js
{ userId: 1, movieId: 1 }
```

## Örnek 4

 uygulamanın bu kontrolü değil, veritabanındaki indekstir**.

---

Benzersiz indeksin sınırını da görelim. Bu kural **aynı kullanıcı–film çiftinin iki kez kaydedilmesini** engeller; fakat iki isteğin aynı sayaç değerini artırması gibi bambaşka bir sorunu çözmez. Sunucu, indeksin reddettiği ikinci kaydı API'de uygun bir yanıtla karşılamalıdır.

## Benzersiz İndeks Her Sorunu Çözmez

55. bölümde ortalama puanı doğrudan `Review` kayıtlarından hesaplamayı seçtik. Burada ise yalnız **alternatif tasarımı** anlamak için `Movie.ratingCount` diye bir sayaç tuttuğumuzu varsayacağız.

Bir yorum oluşturup bu sayacı ayrı bir yazmayla artırırsak, yorum kaydedildiği hâlde sayaç artmayabilir. Benzersiz indeks iki farklı kaydın **birlikte tamamlanmasını** sağlamaz. Başka çözüm arayacağımız nokta tam da burasıdır.

Tek bir belgedeki sayacı güvenli artırmanın yolu ise daha dardır: `$inc` gibi atomik bir güncelleme.

## Tek Bir Kaydı Bölünmez Biçimde Güncellemek

Tek bir film kaydındaki sayacı artırmak istiyorsak şu örneğe bakalım:

Tek bir film kaydına uygulanan bu atomik güncelleme, `src/services/movies.js` içinde kullanılabilecek bir örnektir. Bu bölümde mevcut fonksiyonun tamamını değiştirmiyoruz.

```js
await Movie.findByIdAndUpdate(movieId, {
  $inc: { ratingCount: 1 },
});
```

## Örnek 5

Bunun yerine sayacı önce uygulamaya okuyup sonra artırdığımız şu yaklaşımı düşünelim:

```js
movie.ratingCount += 1;
await movie.save();
```

## Örnek 6

se: İyimser Eşzamanlılık Denetimi

Ada ve Deniz aynı film kaydını açtığında ikisi de o andaki veriyi görür. Ada önce değişiklik yapıp kaydederse, Deniz'in hâlâ eski bilgilere bakarak yaptığı kayıt **Ada'nın değişikliğini ezebilir**. Bunu önlemek için kaydın biz onu okuduktan sonra değişip değişmediğini kontrol edebiliriz. Bu yönteme **iyimser eşzamanlılık denetimi (optimistic concurrency)** denir.

Mongoose'un `__v` alanı, belge üzerindeki değişiklikleri izlemek için kullanılabilen bir sayıdır. Örneğin Deniz filmi açtığında `__v` değeri `2` olsun. Ada'nın kaydettiği değişiklik bu değeri `3`e çıkardıysa, Deniz'in eski `2` değerine dayanarak kaydetmesine izin vermeyebiliriz. **Buradaki `__v` ile 49. bölümdeki `authVersion` aynı şey değildir:** İlki belge üzerindeki değişiklikleri fark etmek, ikincisi eski erişim JWT'lerini reddetmek içindir.

Bu kontrolün çalışması için Mongoose'da uygun eşzamanlılık ayarını veya güncelleme koşulunu gerçekten kullanmalıyız; `__v` alanının bulunması tek başına bütün çakışmaları engellemez. Her yarış durumunda çok belgeli transaction kullanmak yerine önce sorunu daha dar bir yöntemle çözebilir miyiz diye bakacağız.

Önce şu sırayla düşünmek yararlıdır:

```text
Aynı kaydı engellemek için benzersiz indeks yeterli mi?
Tek kaydı koşullu ve atomik güncelleyebilir miyiz?
Bir başkasının arada kaydı değiştirdiğini kontrol etmeli miyiz?
Birden fazla kaydın değişmesini birlikte güvenceye almak şart mı?
```

## Örnek 7

---

## Aynı R1 Yenileme Belirteci İki Kez Kullanılırsa

32. bölümde iki isteğin aynı R1'i tüketmeye çalışmasını şu koşullu güncellemeyle sınırlandırmıştık:

Bu koşullu güncellemenin gerçek yeri `src/services/auth.js` içindeki `rotateRefreshToken()` fonksiyonudur. Burada kodu yeniden eklemiyoruz; eşzamanlı istek riskini açıklıyoruz.

```js
findOneAndUpdate({
  tokenHash,
  usedAt: null,
  revokedAt: null,
})
```

## Örnek 8

gibi conditional atomic update ile azaltmıştık.

Bu da bir yarış durumudur: İki istek aynı R1'i aynı anda tüketmeye çalışabilir. Buradaki koşullu güncelleme, **yalnız daha önce kullanılmamış ve iptal edilmemiş** kaydın işleme alınmasını hedefler. Filmde tekrarlı kayıtları engelleyen indeksle belirtecin iki kez kullanılmasını engelleyen kontrol aynı araç değildir.

## Bu Sorunu Testte Nasıl Görünür Kılarız?

Yarış durumu zamanlamaya bağlıdır: Aynı test bazen hatayı gösterir, bazen göstermez. Birkaç isteği yakın zamanlarda başlatıp sonuçta **veritabanında kaç kayıt kaldığına** bakabiliriz. Tek denemenin başarılı olması sistemin bütün yarışlara karşı korunduğunu kanıtlamaz.

Örneğin iki aynı watchlist POST sonrasında:

```js
const count = await WatchlistItem.countDocuments({
  userId,
  movieId,
});

assert.equal(count, 1);
```
