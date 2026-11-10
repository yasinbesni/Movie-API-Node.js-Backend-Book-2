# Bölüm 64 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# Test Veritabanı Neden Production Veritabanından Ayrı Olmalıdır?

## Bu Testleri Yanlış Veritabanında Çalıştırırsak?

63. bölümde Ada ve Deniz için test hesapları oluşturduk. Bir testin sonunda bu hesapları silmemiz de gerekiyor. Aşağıdaki komut yalnızca veritabanına bağlıdır; **hangi veritabanında çalıştığımızı kendisi sorgulamaz**:

```js
await User.deleteMany({});
```

## Örnek 2

Test veritabanında deneme kullanıcıları temizlenir. Yanlışlıkla gerçek kullanıcıların bulunduğu veritabanına bağlandıysak sonuç ciddi veri kaybı olabilir. Bu nedenle testleri **ayrı bir veritabanında, mümkünse üretim erişimi olmayan ayrı bir kullanıcı hesabıyla** çalıştıracağız. Daha önemli ilke şudur: Bağlantıdan emin değilsek temizleme işlemini hiç başlatmayacağız.

---

## Test Veritabanı İçin Ayrı Bağlantı Ayarı

Ada'nın test hesabını silebiliriz; gerçek hesapları silmemeliyiz. Test bağlantısı için `TEST_MONGODB_URI` adını kullanalım. Bu değişkenin görevi, denemeleri üretim bağlantısından açıkça ayırmaktır.

`.env.test` veya CI secret:

```env
NODE_ENV=test
TEST_MONGODB_URI=mongodb://.../movie_api_test
```

## Örnek 3

Test config:

Test bağlantısını seçen bu örnek, uygulama yapılandırmasını yanlışlıkla değiştirmek yerine yeni `test/helpers/testDatabase.js` gibi **yalnız testte kullanılan bir kurulum modülünde** ele alınabilir. Mevcut MongoDB bağlantı yardımcı dosyamız `src/db/initMongoConnection.js` ile çakışan ikinci bir üretim bağlantısı oluşturmayın.

```js
const mongoUri =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI;
```

## Örnek 4

Bu koşul yalnızca **hangi değişkenin okunacağını** seçer; bağlantının güvenli olduğunu ispatlamaz. Örneğin biri `TEST_MONGODB_URI` içine yanlışlıkla canlı veritabanının adresini yapıştırabilir. Bu nedenle testin başlamadan önce *gerçekte nereye bağlandığını* denetlemesi ve şüpheli durumda durması gerekir.

En güçlü ayrım, test kullanıcısına canlı veritabanına erişim hakkı vermemektir. Beklenen test veritabanı adını kontrol etmek ek bir önlemdir; tek başına garanti değildir.

## Yanlış Veritabanına Bağlanmayı Nasıl Engelleriz?

Test bootstrap içinde:

```js
if (process.env.NODE_ENV !== "test") {
  throw new Error(
    "Testler yalnız NODE_ENV=test ile çalıştırılabilir.",
  );
}

if (!process.env.TEST_MONGODB_URI) {
  throw new Error("TEST_MONGODB_URI gerekli.");
}
```

## Örnek 5

İsterseniz database adının beklenen suffix'i taşıdığını da kontrol edebilirsiniz:

```js
if (!process.env.TEST_MONGODB_URI.includes("_test")) {
  throw new Error("Güvenli test database adı bulunamadı.");
}
```

## Örnek 6

Bu kontrol, adlandırma hatalarını yakalayabilir; ancak bağlantı adresine `_test` yazılması sunucuya gerçekten güvenli erişildiğini kanıtlamaz. **Bağlandığımız veritabanının adını ve kullanıcının yetkilerini ayrıca doğrulamalıyız.**

## Test Verisini Hazırlama ve Temizleme

```js
before(async () => {
  await mongoose.connect(
    process.env.TEST_MONGODB_URI,
  );
});

after(async () => {
  await mongoose.connection.close();
});
```

## Örnek 7

 iki filmi var” beklentisi yanlış sonuç verebilir. İdeal olarak bir testin başlangıç koşulları diğer testin sonucundan bağımsızdır. Bütün veritabanını `dropDatabase()` ile silmek yerine etki alanını mümkün olduğunca dar tutun; paralel testlerde aynı kayıtları temizleyip birbirinizin testini bozmayın.

## Benzersiz İndeksler Testte de Bulunmalı

Ada'nın aynı filmi iki kez kaydetmesini engelleyen birleşik benzersiz indeksin çalıştığını düşünelim. Test veritabanında bu indeks oluşturulmamışsa iki kayıt birden kaydedilir; test, canlı sistemin kuralını temsil etmez.

Bu yüzden `User.email` ve `WatchlistItem` için gerekli benzersiz indekslerin test veritabanında gerçekten varlığını kontrol edin. **Şemada indeksin tanımlanması ile veritabanında oluşturulması aynı an değildir.** İndeks kurulumu tamamlanmadan eşzamanlı istek testini başlatmayın.

## Test Sırasında Gerçek E-posta Göndermeyelim

Ada “Parolamı unuttum” isteği gönderince gerçek e-posta hizmetine mesaj yollamak yerine, mesajı bellekte tutan bir **sahte gönderici (fake adapter)** kullanabiliriz. Böylece test, Ada'nın posta kutusuna gerçekten mail göndermeden, doğru sıfırlama bağlantısının hazırlanıp hazırlanmadığını kontrol eder.

```text
POST /auth/forgot-password
          ↓
Sahte gönderici: 1 mesaj kaydedildi
          ↓
Test: Alıcı ve bağlantı beklenen değerlerde mi?
```
