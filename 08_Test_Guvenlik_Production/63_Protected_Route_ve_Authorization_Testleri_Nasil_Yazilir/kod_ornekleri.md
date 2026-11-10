# Bölüm 63 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# Korumalı Yolları ve Yetki Kontrollerini Nasıl Test Ederiz?


## Giriş Başarılıysa Her İstek de Başarılı Olmalı mı?

Ada, kendi film kaydını düzenlemek için Movie API'ye giriş yaptı. Aynı kimlikle Deniz'in kaydını değiştirmeye kalkarsa ne olur? Sunucu isteği reddetmeli **ve Deniz'in verisini olduğu gibi bırakmalıdır.** Bu bölümde yalnız başarılı istekleri değil, sistemin durdurması gereken işlemleri de test edeceğiz. Her örnekte iki sonucu yan yana göreceğiz: *API ne döndü ve veritabanındaki kayıt gerçekten korundu mu?*

## Giriş Başarılı Olsa da İstek Neden Reddedilir?

Ada, `GET /users/me` ile kendi profilini okuyabilir. Fakat aynı çerezle yalnız yöneticilere açık `GET /admin/access-check` yolunu çağırdığında `403 Forbidden` almalıdır. Çünkü **giriş yapmış olmak, her işlem için izin sahibi olmak değildir.**

Üç farklı yanıtı karıştırmayalım:

```text
401 Unauthorized → Kimlik doğrulanamadı; giriş gerekli.
403 Forbidden    → Kimlik biliniyor, fakat bu işleme izin yok.
404 Not Found    → Kaydı göstermiyoruz; bazen başka kişiye ait kaydı gizlemek için de seçilir.
```

## Örnek 2

Son durum, Movie API'nin başkasına ait film kayıtlarını gizleme tercihine bağlıdır; her yetkisiz işlem otomatik olarak `404` dönmez. Kodlarda `401`, `403` veya `404` görmek ilk adımdır. Değiştirme isteği reddedildiyse **ilgili belgenin gerçekten değişmediğini de** sınamalıyız.

## Çerez Olmadan Korumalı Yola Erişilebilir mi?

Örnekleri `test/authorization.test.js` dosyasında toplayabiliriz. Kod parçalarında göreceğiniz `loginAsUser`, `userAAgent` ve `movieA`, test kurulumu sırasında hazırlanan yardımcılar ve kayıtlar için kullandığımız isimlerdir. **Bu yardımcıları ve test verilerini oluşturmadan parçaları tek başına çalıştıramayız.**

```js
it("auth olmadan /users/me 401 döner", async () => {
  const response = await request(app)
    .get("/users/me");

  assert.equal(response.status, 401);
});
```

## Örnek 3

Bu test, korumalı yolun **giriş yapılmadan kullanılamadığını** doğrular. “Kapıda kimlik kontrolü var mı?” sorusunun ilk cevabıdır.

---

## Normal Kullanıcı Yönetici Yoluna Girebilir mi?

38. bölümde yalnızca yetki kararını görmek için oluşturduğumuz `GET /admin/access-check` yolunu kullanalım. O deneme yolunu daha önce kaldırdıysanız, bu testi ayrı test ortamında yeniden açın. Gerçekte bulunmayan `/admin/movies/...` yolunu çağırmak, rol kontrolünün çalışıp çalışmadığını göstermeyecektir.

Önce normal kullanıcıyla giriş yaptıran bir test yardımcısı kullanalım:

```js
const agent = await loginAsUser({
  role: "user",
});
```

## Örnek 4

Sonra:

```js
const response = await agent
  .get("/admin/access-check");

assert.equal(response.status, 403);
```

## Örnek 5

Aynı yolu yönetici rolündeki Deniz'le deneyip erişime izin verildiğini de doğrulayalım. Yalnız Ada'nın reddedilmesi, yolun yanlışlıkla **herkese kapatılmadığını** göstermez; iki sonucu birlikte görmek gerekir.

---

## Sahiplik Kontrolünü İki Kullanıcıyla Sınamak

Ada'nın oluşturduğu `Movie` kaydının başlığı **Interstellar** olsun. Deniz kendi hesabıyla giriş yapıp Ada'nın film kimliğine (`movieA._id`) bir `PATCH` isteği göndermeyi denesin:

```js
const response = await userBAgent
  .patch(`/movies/${movieA._id}`)
  .send({
    title: "Yetkisiz değişiklik",
  });

assert.equal(response.status, 404);
```

## Örnek 6

Burada `userBAgent`, Deniz'in girişini koruyan Supertest istemcisidir; `movieA` ise test başlamadan önce Ada için oluşturduğumuz örnek kayıttır. Beklediğimiz `404`, başka kullanıcıya ait kaydı gizleyen **bu API tasarımının** sonucudur. Ardından test veritabanında aynı filmi yeniden okuyalım: başlık hâlâ **Interstellar** olmalıdır. Böylece yalnızca hata mesajını değil, **yetkisiz değişikliğin gerçekleşmediğini** de kanıtlamış oluruz.

## Ada Kendi Film Kaydını Güncelleyebilmeli

Yalnız reddedilmesi gereken isteği test etmek yetmez: Ada kendi kaydını düzenleyebiliyor mu, onu da görelim.

```js
const response = await userAAgent
  .patch(`/movies/${movieA._id}`)
  .send({
    title: "Yeni başlık",
  });

assert.equal(response.status, 200);
assert.equal(
  response.body.data.title,
  "Yeni başlık",
);
```

## Örnek 7

Ada’nın kendi kaydını değiştirebilmesi ve Deniz’in Ada’nın kaydını değiştirememesi birlikte sınandığında **yetki sınırının** doğru kurulduğunu gösteririz.

---

## Kişisel Film Listesinde Başka Kullanıcının Kaydı Görünür mü?

Ada'ya iki, Deniz'e bir film kaydı oluşturalım. Ada aşağıdaki korumalı yolu çağırdığında yalnız kendi iki kaydını görmeli:

```http
GET /users/me/movies
```

## Örnek 8

Burada neden `GET /movies` kullanmıyoruz? Çünkü bu yol **herkese açık film kataloğu** için; `GET /users/me/movies` ise giriş yapan kişinin eklediği kayıtları `owner` bilgisine göre sınırlar.

Sonuçtaki iki belgenin de `owner` değeri Ada'yı göstermeli. Sayfalama yanıtındaki `total` değeri de **2** olmalı. Deniz'in filmi listeden gizlenip `total: 3` dönerse özel kaydın varlığına ilişkin bilgi hâlâ açığa çıkabilir. Yani sınırı hem liste sorgusuna hem toplam sayımına uygulamalıyız.

## Hesabı Kapatılan Kullanıcının Çerezi Çalışır mı?

Ada giriş yaptıktan sonra test veritabanında hesabın etkinlik alanını değiştirelim:

```js
isActive = false
```

## Örnek 9

yapalım.

Eski access cookie ile protected route çağrıldığında:

```http
401
```

## Örnek 10

bekleriz.

Ada'nın eski çerezi tarayıcıda duruyor olabilir. Buna rağmen korumalı istek `401` alıyorsa `authenticate` ara katmanının yalnız JWT imzasını değil, **kullanıcı hesabının güncel durumunu** da kontrol ettiğini görürüz.

---

## Parola Değişince Eski JWT Reddediliyor mu?

Ada giriş yaptığında sunucu ona, o andaki `authVersion` sayısını taşıyan bir erişim JWT'si verir. Örneğin hem kullanıcı kaydında hem JWT'de sayı `0` olsun. **Önce bu JWT ile korumalı isteğin başarılı olduğunu doğrulayın.**

Şimdi test veritabanında kullanıcıya ait sayıyı bir artırın:

```js
$inc: { authVersion: 1 }
```

## Örnek 11

JWT'nin içindeki sayı `0` olarak kaldı; kullanıcı kaydındaki değer artık `1`. **Aynı erişim JWT'sini taşıyan çerezle** korumalı isteği yeniden gönderdiğinizde beklediğimiz yanıt:

```http
401
```
