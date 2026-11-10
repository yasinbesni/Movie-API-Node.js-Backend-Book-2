# Bölüm 56 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# `multipart/form-data` Nedir ve JSON'dan Neden Farklıdır?


## Profil Fotoğrafı Neden JSON Alanı Gibi Gelmiyor?

Ada'nın film listesi veya profil adı gibi bilgilerini JSON ile gönderebiliyoruz. Fakat Ada profil fotoğrafını yüklediğinde yalnız dosyanın adını değil, **fotoğrafı oluşturan gerçek dijital veriyi (baytları)** da sunucuya ulaştırmamız gerekir. `multipart/form-data`, metin alanlarını ve dosyayı **tek HTTP isteğinin ayrı bölümleri** olarak taşımamızı sağlar. Önce bu bölümlerin nasıl ayrıldığını, sonra dosya kabul etmenin getirdiği güvenlik sorumluluklarını göreceğiz.

## Dosyanın Adı, Dosyanın Kendisi Değildir

Ada adını değiştirdiğinde JSON içindeki `displayName` alanını okuyabiliyoruz. Fakat profil fotoğrafında, `foto.jpg` adını göndermek fotoğrafın kendisini göndermek değildir: sunucunun görseli saklayabilmesi için dosyanın içeriğine de ulaşması gerekir. JSON içinde yalnızca şöyle bir değer gönderirsek ne eksik kalır?

```json
{
  "avatar": "...binary image..."
}
```

## Örnek 2

Dosyayı **Base64** denilen yöntemle harf ve rakamlardan oluşan bir metne dönüştürüp JSON içinde göndermek de mümkündür. Ancak bu işlem dosyanın taşınan boyutunu büyütür. Dosya yükleme süreci (*upload akışı*) için hazırlanmış `multipart/form-data`, metinle dosyayı ayrı alanlar hâlinde taşımayı kolaylaştırır.

Dosya ve metin alanlarını birlikte göndermek için yaygın biçim:

```text
multipart/form-data
```

## Örnek 3

olur.

---

## Bir İstekte Birden Çok Parça

Ada'nın profil fotoğrafı birkaç yüz kilobaytlık bir dosya olsun. JSON içine yalnızca `"avatar": "foto.jpg"` yazarsak sunucu dosyanın **adını** öğrenir; fotoğrafın baytlarını almış olmaz. `multipart/form-data`, aynı istekte hem metin alanlarını hem gerçek dosya içeriğini taşıyabilmemiz için kullanılır.

Buradaki **multipart** sözcüğü, "birden çok parçadan oluşan" anlamına gelir. İsteğin gövdesi (*body*: sunucuya gönderdiğimiz verilerin bulunduğu bölüm) ayrı alanlara bölünür. Örneğin Ada'nın adı bir parça, fotoğrafının gerçek içeriği başka bir parça olabilir:

```text
Part 1
name = Ada

Part 2
avatar = profile.png
Content-Type: image/png
(binary bytes)
```

## Örnek 4

Tarayıcı parçaların arasına **sınır işareti** (*boundary*) ekler; böylece sunucu ad alanının nerede bittiğini ve fotoğrafın nerede başladığını ayırabilir. `FormData`, tarayıcının bu tür istek hazırlamak için sunduğu yapıdır. Tarayıcı sınır işaretini kendi üretir ve `Content-Type` (**istekteki verinin türünü bildiren başlık**) içine yazar.

---

## Tarayıcıda `FormData` ile Dosya Göndermek

```js
const formData = new FormData();
formData.append("avatar", file);

await fetch("/users/me/avatar", {
  method: "POST",
  body: formData,
  credentials: "include",
});
```

## Örnek 5

Bu örnekte `file`, kullanıcının seçtiği fotoğraf dosyasıdır; `append("avatar", file)` ise dosyayı istekteki `avatar` adlı alana ekler. `fetch()` isteği gönderir. `credentials: "include"`, uygun koşullarda oturum çerezlerinin de bu istekle gönderilebilmesini sağlar.

**`Content-Type` başlığını elle `multipart/form-data` diye ayarlamıyoruz.** Çünkü sınır işaretini de yazmak gerekir; tarayıcı `FormData` kullanıldığında bunu bizim yerimize doğru biçimde oluşturur. Sınır işareti eksikse sunucu metnin ve dosyanın nerede ayrıldığını çözemeyebilir.

---

## `express.json()` Neden Yetmez?

```js
app.use(express.json());
```

## Örnek 6

`express.json()`, isteğin **JSON gövdesini okuyup JavaScript değerlerine ayırır**; buna *ayrıştırma (parse)* denir. Fakat Ada'nın `multipart/form-data` isteğinde fotoğrafın baytları ve metin alanları ayrı bölümlerdedir. Bu işi `express.json()` tek başına yapamaz.

Bu nedenle **multipart ayrıştırıcısı** kullanan bir ara katmana (*middleware*: Controller'dan önce isteği işleyen fonksiyon) ihtiyaç duyarız. Dosya sayısına ve kullanılan araca göre bu ara katman şu alanları doldurabilir:

```text
req.file
req.files
req.body
```

## Örnek 7

den dosya biçiminde kodlama) denir.

Bu adımların tümüne **görsel işleme süreci (*image processing pipeline*)** deriz: **dosyayı al → içeriğini kontrol et → görüntüyü çöz → uygun biçimde yeniden oluştur → sakla**. Yeniden oluşturma, bazı beklenmeyen ek verileri ayıklayarak riski azaltabilir; **zararlı içeriğe karşı kesin güvenlik garantisi vermez**. Dosya boyutu, piksel sayısı, kullanılan kütüphanenin güvenliği ve saklama izinleri de önemlidir.

**Bu bölümde böyle bir görsel işleme kodu kurmuyoruz.** Bir sonraki bölümde Multer ile dosyayı alacağız; daha ileri içerik doğrulamasının bunun dışında ayrı bir güvenlik adımı olduğunu bilmemiz yeterli.

---

## Dosya Boyutuna Neden Sınır Koyuyoruz?

Ada'nın profil fotoğrafı için yüzlerce megabaytlık bir dosya gerekmez. Bu yüzden dosya yükleme ara katmanında (*upload middleware*) örneğin **2 MB** sınırını belirleyebiliriz. Sınır aşılırsa dosyayı işlemek yerine isteği reddederiz; böylece bellek ve disk kaynaklarını gereksiz tüketmeyiz. Gerçek sınır, uygulamanın ihtiyacına göre seçilir.

---

## Profil Bilgisi ile Fotoğrafı Ayrı Yollardan Göndermek

Ada'nın adını değiştirmek için metin verisi içeren bir **API yolu (endpoint)** kullanabiliriz:

```http
PATCH /users/me
Content-Type: application/json
```

## Örnek 8

Fotoğrafın kendisini göndermek için ise başka bir yol kullanabiliriz:

```http
POST /users/me/avatar
Content-Type: multipart/form-data
```
