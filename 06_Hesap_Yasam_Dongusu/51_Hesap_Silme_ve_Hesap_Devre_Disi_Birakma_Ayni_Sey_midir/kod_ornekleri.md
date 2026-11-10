# Bölüm 51 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# Hesap Silme ve Hesap Devre Dışı Bırakma Aynı Şey midir?


## Ada Hesabını Kapatmak İsterse Ne Yapacağız?

Ada'nın e-posta bağlantılarını artık gönderebiliyoruz; hesap kurtarma akışı da böylece gerçek kullanıcıya ulaşabilecek. Fakat kullanıcı bir gün hesabını kullanmayı bırakmak isteyebilir. **Hesabı devre dışı bırakmakla verileri kalıcı olarak silmek aynı işlem değildir.** Yorumların, izleme listesinin, önceki girişlerin ve saklama yükümlülüklerinin nasıl etkileneceğini ayrı değerlendireceğiz.

## `User.findByIdAndDelete()` En Kolay Ama Her Zaman En Doğru İşlem Değildir

Ada artık bir hesapla giriş yapıp Movie API'yi kullanabiliyor. Bir gün uygulamada “Hesabımı kapat” seçeneğini gördüğünü düşünelim. Bu düğmeye bastığında ne olmasını bekler? Yeniden giriş yapamamak mı, yoksa hesabıyla ilgili bütün kayıtların silinmesi mi? Bu ikisi aynı sonuç değil.

Film kataloğuna eklediği kayıtlar, yenileme belirteçleri ve ileride oluşacak kişisel liste kayıtları hesapla ilişkili olabilir. Bu yüzden ilk aklımıza gelen tek satırlık silme işlemini hemen çalıştırmak yerine, önce **hangi verinin ne olacağını** belirleyeceğiz.

İlk akla gelen şu tek satır olabilir:

```js
await User.findByIdAndDelete(req.user._id);
```

## Örnek 2

Ancak Ada'nın hesabı tek başına durmuyor. Aşağıdaki kayıtlar o hesaba bağlı olabilir:

```text
Movie.owner
RefreshToken
verification/reset kayıtları
diğer user-referenced veriler
```

## Örnek 3

Ada'nın kullanıcı belgesini silersek ona bağlı film veya oturum kayıtları kendiliğinden silinmeyebilir. Bu durumda başka belgelerin işaret ettiği kullanıcı artık bulunmaz; ayrıca şüpheli bir hesabın geçmiş işlemlerini araştırmak da zorlaşabilir. Bu nedenle önce “hesabı erişime kapatmak mı, verileri kalıcı silmek mi?” sorusuna cevap vermeliyiz.

---

## Hesabı Devre Dışı Bırakmak (Deactivation)

Ada giriş yapamasın ama veriler silinmeden kalsın istiyorsak `User` şemasına şu iki alanı ekleyebiliriz:

Bu alanların ekleneceği yer mevcut `src/db/models/user.js` dosyasındaki `userSchema` tanımıdır. Aşağıdaki parça tam bir model dosyası değil, şemaya eklenecek alanlardır.

```js
isActive: {
  type: Boolean,
  default: true,
},

deactivatedAt: {
  type: Date,
  default: null,
},
```

## Örnek 4

Hesabı devre dışı bırakırken bu alanları güncellememiz gerekir. Aşağıdaki parça Controller’ın bildiği `req.user._id` değerini kullanarak işlemin mantığını gösterir. Gerçek uygulamada Controller bu kimliği `src/services/users.js` içindeki işleme parametre olarak aktarır. **Bu örnek tek başına çalışan bir hesap kapatma endpoint’i değildir**; Service, Controller ve Router bağlantısının tamamlanması gerekir.

```js
await User.findByIdAndUpdate(req.user._id, {
  $set: {
    isActive: false,
    deactivatedAt: new Date(),
  },
  $inc: {
    authVersion: 1,
  },
});
```

## Örnek 5

Buradaki `$inc: { authVersion: 1 }`, 49. bölümde kurduğumuz **eski JWT'leri reddetme sayacını** bir artırır: Hesap kapanmadan önce verilmiş JWT'lerin içindeki sayı artık kullanıcı kaydındaki sayıyla eşleşmez. Ardından Ada'ya ait yenileme belirteçlerini `revokedAt` alanlarını doldurarak iptal ederiz; böylece onlarla yeni access token da üretilemez. Hesabı yalnızca `isActive: false` yapmakla yetinmiyor, önceden verilmiş giriş haklarını da ele alıyoruz.

---

## Authentication Middleware Aktif Hesabı Kontrol Etmeli

Hesap etkinliği kontrolünün yeri `src/middlewares/authenticate.js` içindeki, kullanıcıyı veritabanından bulduğumuz bölümdür. Bu kontrol yapılmadıkça yalnızca `isActive` alanını eklemek eski JWT’leri kendiliğinden reddetmez.

```js
if (!user || !user.isActive) {
  throwUnauthorized();
}
```

## Örnek 6

Böylece Ada'nın elinde eski bir erişim belirteci bulunsa bile korumalı yol bu hesabı kabul etmez. Bunun mümkün olmasının nedeni, 35. bölümde her korumalı istekte **User kaydının güncel durumuna bakmayı** seçmiş olmamızdır.

---

## Veriyi Kalıcı Olarak Silmek Ne Zaman Gerekir?

Hesabı devre dışı bırakmakla veriyi **kalıcı olarak silmek** (hard delete) farklı sonuçlar doğurur. Hangi verinin ne kadar süre tutulacağı, uygulamanın işleyişine ve yürürlükteki yükümlülüklere bağlıdır.

Bazı sistemler:

```text
önce deactivate
↓
belirli retention süresi
↓
anonimleştirme veya hard delete
```

## Örnek 7

film kataloğundaki bir filmi, Ada hesabını kapattı diye silmek Deniz'in izleme listesini de bozabilir. Her kaydı topluca silmek yerine kimin verisi olduğunu ve silmenin kimi etkileyeceğini soruyoruz.

Tek bir `delete user` fonksiyonuna düşünmeden cascade eklemek veri kaybına neden olabilir.

---

Ada hesabını devre dışı bıraktığında sistemdeki yorumlar ve izleme listesi için ne yapılacağı ayrı bir karardır. Hesabı pasifleştirmek, kullanıcının sonraki girişini durdurabilir; **verilerini otomatik ve kalıcı olarak silmez**. Kalıcı silme seçeneğinde ise yalnız `User` belgesini kaldırmak yetmeyebilir: kişisel liste, avatar dosyası, token kayıtları ve denetim kayıtlarının saklama kuralları da değerlendirilmelidir. Hangi verinin kaldırılacağı ile hangi verinin yasal veya güvenlik gerekçesiyle tutulacağı birbirine karıştırılmamalıdır.

## "Hesabı Geri Aç" İhtiyacı

Ada hesabını yanlışlıkla kapattığını fark edip yeniden açmak istediğinde ne olacak? Kullanıcı kaydı veritabanında durduğu için hesabı yeniden etkinleştirmek mümkün olabilir. Fakat “Hesabımı geri aç” isteğini gönderen kişinin gerçekten Ada olduğunu nasıl anlayacağız?

İlk bakışta yalnızca şu alanı değiştirmek yeterli görünebilir:

```js
isActive = true
```

## Örnek 8

leme listesi kayıtları otomatik olarak silinmedi. İşlem başarıyla tamamlandığında arayüzde şu mesaj gösterilebilir:

> Hesabınız devre dışı bırakıldı. Bu hesapla artık giriş yapamazsınız. Hesabınıza bağlı veriler henüz kalıcı olarak silinmedi.

Bu mesaj Ada'nın hem **ne değiştiğini** hem de **ne değişmediğini** anlamasını sağlar. “Hesabınız tamamen silindi” deseydik, veriler gerçekte dururken silinmiş olduklarını iddia etmiş olurduk.

**İkinci senaryo — Kalıcı silme işlemi gerçekten tamamlandı:** Uygulamada verilerin silinmesine yönelik ayrı bir süreç tasarlanmış ve tamamlanmışsa mesaj farklı olabilir:

> Hesabınız silindi. Silme kapsamındaki kişisel verileriniz kaldırıldı. Saklanması zorunlu olan kayıtlar varsa bunlar ilgili saklama kurallarına göre yönetilir.

**Bu ikinci işlem henüz burada uygulanmış değil.** Gerçekten silmediğimiz veriler için böyle bir başarı mesajı göstermeyiz. Silme isteği alınıp işlem sonraya bırakılıyorsa “Talebiniz alındı; silme işlemi henüz tamamlanmadı” demek gerekir.

## Ada'ya Hangi HTTP Yanıtını Göndereceğiz?

Hesap devre dışı bırakıldıktan sonra tarayıcıda eski kimlik doğrulama çerezlerinin kalmasını da istemeyiz. Bu nedenle onları temizleyebiliriz:

```js
clearAuthCookies(res);
```

## Örnek 9

İşlem başarıyla tamamlandığında:

```http
204 No Content
```

## Örnek 10

rmez**; yukarıdaki açıklayıcı metni doğrudan bu HTTP yanıtına eklemeyiz. Tarayıcıdaki arayüz, başarılı `204` yanıtını aldıktan sonra “Hesabınız devre dışı bırakıldı…” mesajını gösterebilir. Mesajı API'nin JSON yanıtında taşımak isteseydik `200 OK` gibi gövdeye izin veren bir yanıt tercih etmemiz gerekirdi.

Bu başarılı yanıtın arkasında üç gerçek değişiklik bulunmalı: Yenileme belirteçleri iptal edilmiş, `authVersion` artırılmış ve kullanıcı kaydı devre dışı bırakılmış olmalı. **Yalnızca çerezi temizlemek hesabın kapandığı anlamına gelmez.**

---

## Deactivation Sonrası Yeni Login de Engellenmelidir

Sadece protected route middleware'inde `isActive` kontrol etmek yeterli değildir. Inactive kullanıcı login endpoint'inden yeni access ve refresh credential'ları alabiliyorsa sistem gereksiz ve yanıltıcı token üretir. Bu yüzden login service, parola doğrulamasından sonra hesabın aktiflik politikasını da uygular; refresh service de aynı durumu kontrol eder. Örneğin login akışındaki parola kontrolünden sonra:

Bu kontrol, `src/services/auth.js` içindeki giriş işlevinin kullanıcıyı doğruladığı bölüme aittir. Ayrıca aynı dosyadaki refresh işleminin de hesap etkinliğini denetlemesi gerekir.

```js
if (!user.isActive) {
  throwUnauthorized();
}
```
