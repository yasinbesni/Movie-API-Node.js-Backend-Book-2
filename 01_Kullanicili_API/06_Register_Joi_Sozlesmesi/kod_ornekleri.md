# Bölüm 6 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# Register İsteğinde Hangi Bilgilere Güvenebiliriz?

## Ada Hesap Oluşturmak İstiyor

Ada artık *Interstellar*'ı kendi listesinde tutmak istiyor. Uygulama ona önce bir hesap oluşturma ekranı gösteriyor. Adını, e-posta adresini ve bir parola yazıyor; ardından **Kayıt ol** düğmesine basıyor.

Bizim API'mize ulaşacak istek kabaca şöyle:

```http
POST /auth/register
Content-Type: application/json
```

## Örnek 2



```json
{
  "name": "Ada",
  "email": "ADA@EXAMPLE.COM",
  "password": "uzun-bir-deneme-parolasi"
}
```

## Örnek 3

Beşinci bölümde `User` modelini hazırlamıştık. Fakat modelin varlığı, gelen her veriyi olduğu gibi kabul etmemiz gerektiği anlamına gelmez. Ada yanlışlıkla adını boş bırakabilir. Bir başkası geçersiz bir e-posta gönderebilir. Hatta isteğin içine formda hiç bulunmayan bir alan da ekleyebilir:

```json
{
  "name": "Ada",
  "email": "ada@example.com",
  "password": "uzun-bir-deneme-parolasi",
  "role": "admin"
}
```

## Örnek 4

Sunucuya böyle bir alan yazmak, kişiyi yönetici yapmaz. Ancak **hangi alanları kabul ettiğimizi bizim belirlememiz gerekir**. Kayıt işlemini veritabanına ulaştırmadan önce bu sınırı koyacağız.

---

## Model ile Gelen İsteğin Görevi Aynı Değil

`User` modeli saklanacak bilgilerin yapısını tanımlıyor. Kayıt isteği ise kullanıcının bize **göndermesine izin verdiğimiz** bilgileri taşıyor.

Bunları karşılaştıralım:

```text
Kayıt isteğinde:          Veritabanındaki User kaydında:
name                      name
email                     email
password                  passwordHash
                          createdAt
                          updatedAt
```

## Örnek 5

Ada parolasını gönderir; veritabanı onun parolasını olduğu gibi saklamaz. `passwordHash` alanını sunucu daha sonra üretecek. Bu bölümde yalnızca kayıt isteğini denetleyeceğiz. **Henüz kullanıcı oluşturmayacağız.**

Film ekleme isteğinde olduğu gibi, hesap oluşturma isteğindeki bilgileri de veritabanına göndermeden önce kontrol etmemiz gerekiyor. Bunun için **Joi** kullanacağız. Joi, gelen verinin belirlediğimiz kurallara uyup uymadığını denetleyen bir JavaScript kütüphanesidir. **Neden yalnızca Mongoose'a bırakmıyoruz?** Çünkü formdaki yanlış veya fazladan alanları daha veritabanına ulaşmadan fark etmek, Ada'ya anlaşılır bir hata döndürmemizi ve kayıt işlemine hangi verilerin gireceğini açıkça belirlememizi sağlar. Mongoose'un model kuralları da korunur; bu iki kontrol aynı işin gereksiz tekrarı değil, isteğin ve verinin farklı sınırlarıdır.

---

## Register Sözleşmesini Yazalım

Yeni dosyamız:

```text
src/validation/auth.js
```

## Örnek 6



```js
import Joi from "joi";

export const registerUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(15).max(128).required(),
});
```

## Örnek 7

nemez.

Bunun pratik sonucu şu: Birisi tarayıcıdaki formu değiştirip isteğe `role: "admin"` eklese bile yetki kazanmıyor. Çünkü kurala tarayıcı değil, Movie API karar veriyor. `Joi.object(...)` bu üçünün dışındaki alanları varsayılan ayarlarda reddedecek.

`name` için baştaki ve sondaki gereksiz boşlukları kaldırıyoruz. `email` için de aynı işlemi yapıyor ve harfleri küçük biçime dönüştürüyoruz. Böylece `ADA@EXAMPLE.COM` ile `ada@example.com` kayıt sürecinde farklı hesaplar gibi ele alınmayacak.

Parolada ise bilerek `trim()` ya da `lowercase()` kullanmıyoruz. Ada'nın parolasını onun haberi olmadan değiştirmemeliyiz. Ayrıca parola için **en az 15 karakter** istiyoruz. Bu seçim, yalnız parolayla giriş yapılan sistemler için güncel NIST önerisiyle uyumludur; tek başına güçlü bir parola garantisi değildir. Bilinen veya ele geçirilmiş parolaların engellenmesi gibi ek korumalar da gerçek ürünün güvenlik politikasında düşünülmelidir.

Çok uzun girdilerin kontrolsüz biçimde işlenmesini önlemek için Movie API örneğimizde üst sınırı 128 karakter olarak belirliyoruz. Daha sonra gerçek ürünün ihtiyaçlarına göre bunu yeniden değerlendirebiliriz.

Özellikle şuna benzer zorunluluklar koymuyoruz:

```text
1 büyük harf + 1 rakam + 1 özel karakter
```

## Örnek 8

Böyle kurallar, parolayı her zaman daha güvenli yapmaz; bazen tahmin edilebilir kalıpları teşvik eder.

---

## `role: "admin"` Gönderilirse Ne Olacak?

Burada ikinci önemli korumamız devreye giriyor. `Joi.object(...)`, bu örnekteki ayarlarla tanımlanmayan bir alanı varsayılan olarak kabul etmez. Dolayısıyla `role` içeren istek **validation aşamasında reddedilir**.

Uygulamada zaten bulunan `validateBody` ara katmanı da şu davranışı kullanıyor:

Burada davranışını incelediğimiz mevcut doğrulama ara katmanı `src/middlewares/validateBody.js` dosyasındadır; bu kodu yeni bir dosyaya kopyalamıyoruz.

```js
const { error, value } = schema.validate(req.body, {
  abortEarly: false,
});
```

## Örnek 9

Bu ayarlarda `allowUnknown: true` verilmediği için `role` kabul edilmiyor. Doğrulama başarılıysa `req.body = value` yapılıyor; böylece e-posta normalleştirilmiş değeriyle Controller'a ulaşabiliyor.

Buradaki fark önemlidir: Sadece ekranda `role` alanını göstermemek güvenlik sağlamaz. İstekte hangi alanların kabul edileceğine **backend** karar verir.

Henüz `POST /auth/register` Route'unu bağlamadık. Aşağıdaki kısa denemeler bu nedenle şimdilik Joi sözleşmesine aittir; HTTP endpoint'ini 10. bölümde oluşturacağız.

---

## Üç İsteğin Üç Farklı Sonucu

**Birinci istek:** Ada formu doğru doldurur.

```json
{
  "name": "Ada",
  "email": "ADA@EXAMPLE.COM",
  "password": "uzun-bir-deneme-parolasi"
}
```

## Örnek 10

Bu veri doğrulamadan geçer; e-posta `ada@example.com` olur.

**İkinci istek:** Bir kullanıcı kısa parola ve geçersiz e-posta gönderir.

```json
{
  "name": "A",
  "email": "yanlis",
  "password": "123"
}
```

## Örnek 11

Bu veri geçmez. Hangi alanlarda sorun olduğunu Joi hata ayrıntılarında belirtir.

**Üçüncü istek:** Kayıt sırasında yetkisini kendisi belirlemeye çalışır.

```json
{
  "name": "Ada",
  "email": "ada@example.com",
  "password": "uzun-bir-deneme-parolasi",
  "role": "admin"
}
```
