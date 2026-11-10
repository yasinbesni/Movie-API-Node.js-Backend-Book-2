# Bölüm 11 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# Kullanıcı Giriş Yaparken Backend Gerçekte Neyi Doğrular?

## Ada Geri Döndü

Ada dün hesabını oluşturdu. Bugün yeniden film listesine bakmak için uygulamayı açtığında karşısına iki alan çıkıyor: e-posta ve parola.

Kayıt sırasında bu bilgileri veritabanına yerleştirmiştik. Şimdi aynı bilgileri almak tek başına yeterli değil. Ada formda `ada@example.com` yazdığında, uygulama bu adresin gerçekten ona ait bir hesabı işaret edip etmediğini ve gönderdiği parolanın doğru olup olmadığını kontrol etmeli.

Üstelik biri Ada'nın e-posta adresini biliyor olabilir. **E-posta adresini bilmek, hesabın sahibi olduğunu kanıtlamaz.**

Giriş işleminin ilk sorusu şu: Gönderilen bilgiler gerçekten kayıtlı hesaba mı ait? Önce bu kararı verecek kodu hazırlayalım; oturum, ancak doğru hesap doğrulandıktan sonra oluşturulabilir.

## Hesabı Bulmak Başlangıç, Doğrulamak Ayrı Bir İş

Ada'nın kayıt sırasında oluşturduğu belgeyi hatırlayalım:

```json
{
  "_id": "...",
  "name": "Ada",
  "email": "ada@example.com",
  "passwordHash": "$argon2id$..."
}
```

## Örnek 2

Login formundan ise şu bilgiler geliyor:

```json
{
  "email": "ADA@EXAMPLE.COM",
  "password": "uzun-bir-deneme-parolasi"
}
```

## Örnek 3

İlk adım, e-posta değerini kayıt sırasında uyguladığımız kuralla aynı biçime getirmek. Altıncı bölümde Joi ile bunu yapmıştık; girişte de aynı tutarlılığı koruyacağız. Ardından kullanıcıyı bulabiliriz:

```js
const user = await User.findOne({ email });
```

## Örnek 4

Bu sorgu hesabı bulur; fakat tek başına parolayı doğrulamaz. Ayrıca beşinci bölümde `passwordHash` alanını normal sorgularda seçilmesin diye ayarlamıştık:

`select: false` kuralı `src/db/models/user.js` içindeki `passwordHash` alanına aittir. Aşağıdaki parça, alanın daha önce belirlediğimiz ayarını hatırlatır; ikinci kez eklenmez.

```js
passwordHash: {
  type: String,
  required: true,
  select: false,
},
```

## Örnek 5

Bunun amacı hash'in, örneğin film listesiyle ilişkili bir kullanıcı bilgisi okunurken gereksiz yere uygulamanın her yanına taşınmamasıdır. Login'de ise bu alana özellikle ihtiyacımız var.

```js
const user = await User.findOne({ email })
  .select("+passwordHash");
```

## Örnek 6

`+passwordHash`, yalnızca **bu sorgu için** normalde gizlenen alanı getirir. `select: false` alanı veritabanından silmez; varsayılan sorgu sonucunun dışında tutar.

## Parolayı Karşılaştırmak İçin Onu Geri Açmıyoruz

User bulunursa dokuzuncu bölümde yazdığımız yardımcı fonksiyonu kullanacağız:

```js
const isPasswordValid = await verifyPassword(
  user.passwordHash,
  password,
);
```

## Örnek 7

`verifyPassword()` kayıtlı hash'i ve Ada'nın az önce gönderdiği parolayı alır. `argon2.verify()` bunların uyumlu olup olmadığını denetler. Hash'in içinden eski parolayı elde etmeye çalışmayız.

Burada iki olasılık var:

```text
Hesap bulundu + parola doğru → kimlik doğrulandı
Hesap bulunamadı veya parola yanlış → giriş başarısız
```

## Örnek 8

Hesap bulunmazsa doğrulanacak bir hash de yoktur. Kod bunu ayrı bir durum olarak işler; ancak **kullanıcıya göstereceğimiz hata mesajı** aynı olabilir. “Böyle bir hesap yok” demek, bir başkasının kayıtlı e-posta adreslerini deneme yoluyla öğrenmesine yardımcı olabilir. 12. bölümde bu güvenlik kararını HTTP hata yanıtımıza uygulayacağız.

## Kullanıcıyı Doğruladık; Her Bilgisini Gönderecek miyiz?

Hayır. Service, doğrulama için `passwordHash` alanını kullanabilir; ama bu değer Response'a çıkmamalı.

Başarılı girişte uygulamanın dışarıya gösterebileceği bilgiler şöyle olabilir:

```js
const publicUser = {
  id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
};
```

## Örnek 9

**Service**, gönderilen parolanın kayıtlı hash ile eşleşip eşleşmediğini kontrol eder. **Controller** ise bu sonuca göre HTTP yanıtını hazırlar. Böylece parola doğrulamasını yanıtın nasıl görüneceğine ilişkin kararlardan ayırmış oluruz.

## Kayıt Formuyla Giriş Formu Aynı Değil

Kayıt sırasında `name`, `email` ve `password` istemiştik. Giriş için yalnızca `email` ve `password` gerekiyor. Bu nedenle `src/validation/auth.js` dosyasına ayrı bir Joi sözleşmesi ekleyelim. Dosyanın başındaki `Joi` import'unu ve `registerUserSchema` tanımını koruyoruz:

```js
export const loginUserSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});
```

## Örnek 10

Girişte parolaya kayıt sırasında kullandığımız minimum uzunluk şartını yeniden uygulamıyoruz. Burada yeni bir parola belirlenmiyor; geçmişte kabul edilmiş bir parolanın doğruluğu sınanıyor. Kayıt politikasının değişmesi, geçerli eski bir hesabı kendiliğinden giriş yapamaz hâle getirmemeli.

Kayıt için ayrı, giriş için ayrı Joi sözleşmemiz var. Aynı kullanıcı hesabıyla çalışsalar da iki formdan beklediğimiz bilgiler farklı; bu yüzden kuralları birbirine zorla uydurmuyoruz.

## Şimdi Neyi Bildiğimizi Görelim

Ada giriş formunu gönderdiğinde sunucunun vereceği karar şu sırayla oluşur:

```text
E-posta aynı biçime getirilir
            ↓
User bulunur (hash yalnızca burada istenir)
            ↓
Gönderilen parola Argon2 ile doğrulanır
            ↓
        Başarılı mı?
```
