# Bölüm 40 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

 Aynı Olan Kullanıcıların Verisini Nasıl Ayırırız?

Deniz'in yönetim görevleriyle Ada'nın kişisel verileri arasındaki sınırı kurduk. Şimdi ikisi de normal kullanıcı olsa bile kendi kayıtlarını değiştirebilmeli, birbirlerinin kayıtlarına dokunamamalı. **Burada rol yeterli değil; hedef kaydın hangi kullanıcıya ait olduğunu** da kontrol edeceğiz. URL'de bir kayıt kimliği bulunması, o kaydın isteği gönderen kullanıcıya ait olduğunu kanıtlamaz.

## Ada'nın Listesiyle Deniz'in Listesi Karışmamalı

Ada ve Deniz'in ileride kendi izleme listelerini oluşturacağını düşünelim. Her ikisi de aynı filmi listesine eklemek isteyebilir. Film kataloğundaki *Interstellar* kaydı ortak olabilir; fakat **Ada'nın kişisel liste kaydı** Deniz'in hesabına ait değildir.

İkisi de giriş yapmış olsa bile Deniz, Ada'nın özel listesini değiştirememeli.

Burada rol kontrolünden farklı bir sorumuz var: “Kullanıcı bu kaydın sahibi mi?” Bu ilişkiye **ownership (sahiplik)** diyoruz.

## Kimlik ve Kayıt Birlikte Kontrol Edilir

Bir kaydı yalnız kimliğiyle aramak yeterli olmayabilir. İsteğe film listesi kaydının kimliği yazıldı diye sunucu onu herkes için düzenlenebilir saymamalıdır.

Örnek bir sahiplik kaydı düşünelim:

```json
{
  "_id": "liste-kaydi-1",
  "movieId": "film-123",
  "owner": "ada-kullanici-id"
}
```

## Örnek 2

Bu örnek **temsili bir liste kaydıdır**; henüz veritabanından okunmuyor. `owner` alanı, kaydın hangi hesaba ait olduğunu gösterecek. 42. bölümde alanı Movie modeline eklediğimizde bu ilişkiyi gerçek veride kullanabileceğiz.

İzin kararı için iki bilgi birlikte kullanılır:

```text
İstenen kayıt kimliği
          +
Kimliği doğrulanmış kullanıcı kimliği
          ↓
      Sahiplik kontrolü
```

## Örnek 3

Sahip olan kullanıcıyı, isteğin gövdesindeki `owner` alanına bakarak seçemeyiz. Çünkü istemci başka birinin kimliğini yazabilir. Güvendiğimiz bilgi, 35. bölümde doğruladığımız `req.user._id` değeridir.

Ada'nın göndereceği URL'de `/watchlist/deniz-kaydi` yazdığını varsayalım. URL'deki kayıt ID'si bir hedefi tanımlar; **o kaydı değiştirmeye izin verildiğini kanıtlamaz**. Güvenilir kullanıcı kimliği `req.user` içinden, kaydın sahibi ise veritabanındaki `owner`/`userId` alanından okunur. İkisini birleştiren sorgu veya kontrol olmadan yalnız doğru biçimli bir ID görmek güvenli işlem için yeterli değildir.

## Denetim Neden Sorguya Yakın Olmalı?

Sahiplik gerektiren bir kaydı Mongoose ile ararken iki koşulun **birlikte** sağlanmasını isteyeceğiz:

```js
const filter = {
  _id: requestedId,
  owner: req.user._id,
};
```
