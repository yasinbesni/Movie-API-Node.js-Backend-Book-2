# Bölüm 67 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

ayacın güvenli artmasını ise atomik güncellemeyle koruduk. Peki **bir işlemin iki farklı kaydı değiştirmesi** gerekiyorsa? Ada'nın yorumu oluşturulup filmin puan sayacı güncellenemezse yarım kalan bir sonuç doğar.

Böyle durumlarda **transaction (işlem bütünlüğü)** düşünebiliriz: Birden fazla veritabanı yazımı ya birlikte tamamlanır ya da hata olursa birlikte geri alınır. Ancak buna her işlemde ihtiyacımız yok; nedenini örnekle görelim.

## Her Veritabanı Yazımında Transaction Gerekli mi?

MongoDB tek bir belge üzerindeki uygun `$set`, `$inc` veya `findOneAndUpdate()` işlemlerini zaten atomik yapabilir. Transaction başlatmak ise ek kaynak tüketir ve hata yönetimini karmaşıklaştırır. Bu nedenle önce şunu soralım:

> İki yazımdan biri başarısız olduğunda diğerinin de geri alınması, uygulamanın doğru çalışması için şart mı?

Cevap hayırsa tek-belge çözümü veya veri modelinde sadeleştirme daha uygun olabilir.

## Yorum Kaydı ile Film İstatistiği Birlikte Değişirse

Ada *Interstellar* filmine 9 puan verdi. Şimdi farklı bir tasarım seçtiğimizi varsayalım: Hem `Review` kaydını oluşturuyoruz hem de `Movie` belgesindeki `ratingCount` ile `ratingSum` sayılarını tutuyoruz. İşlem sırası şöyle:

```text
1. Review oluştur → Ada'nın 9 puanı kaydedilir.
2. Movie.ratingCount artır → değerlendirme sayısı güncellenir.
3. Movie.ratingSum artır → toplam puan güncellenir.
```

## Örnek 2

İkinci adım hata verirse ilk adımın kaydı kalabilir. Sonuçta Ada'nın yorumu görünürken film istatistikleri eski değerde kalır. Transaction'ı kullanma gerekçemiz bu üç veritabanı değişikliğini **tek bir bütün gibi** ele almaktır.

**Önemli ayrım:** 55. bölümde seçtiğimiz gerçek örnek, ortalamayı doğrudan `Review` kayıtlarından hesaplıyor. Buradaki sayaçlı yaklaşım **alternatif bir veri modeli**; mevcut Movie API'ye ikinci bir puanlama sistemi olarak eklemiyoruz.

## Mongoose ile Birlikte Tamamlanan Yazımlar

MongoDB kurulumumuz transaction destekleyen bir **replica set** veya **sharded cluster** olarak yapılandırılmışsa (yani sıradan bağımsız `mongod` süreci değilse):

Bu işlem, yorum oluşturma ve film istatistiğini birlikte güncelleyen bir `src/services/reviews.js` işlevinde kullanılabilecek örnektir. **Aşağıdaki kod bütün Service dosyası değildir**; `mongoose`, `Review`, `Movie` importları ve hata/yanıt akışı ayrıca tamamlanmalıdır.

```js
const session = await mongoose.startSession();

try {
  await session.withTransaction(async () => {
    await Review.create(
      [
        {
          userId,
          movieId,
          rating,
          text,
        },
      ],
      { session },
    );

    await Movie.updateOne(
      { _id: movieId },
      {
        $inc: {
          ratingCount: 1,
          ratingSum: rating,
        },
      },
      { session },
    );
  });
} finally {
  await session.endSession();
}
```

## Örnek 3

Transaction başarıyla tamamlanırsa yorum ve film istatistiği birlikte kalır. İşlem gerçekten hata nedeniyle iptal edilirse ikisinin de etkisi geri alınır. **Dikkat:** Örnekte `Movie.updateOne()` hiçbir film bulamazsa bu her zaman JavaScript hatası üretmez; gerçek uygulamada `matchedCount` değerini kontrol edip hedef film bulunmadığında işlem sırasında hata oluşturmalıyız. Aksi hâlde yorum kaydolup film kaydı güncellenmemiş olabilir.

---

## `create()` Fonksiyonuna Neden Dizi Veriyoruz?

Mongoose transaction/session kullanımında `Model.create()` için array + options biçimi yaygın ve açıktır:

```js
Review.create([doc], { session });
```
