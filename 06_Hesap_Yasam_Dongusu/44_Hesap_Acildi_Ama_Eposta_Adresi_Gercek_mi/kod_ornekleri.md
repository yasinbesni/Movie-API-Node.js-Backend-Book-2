# Bölüm 44 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

 bir bağlantı göndereceğiz. Ada bağlantıdaki rastgele doğrulama değerini süresi içinde kullandığında, Movie API bu posta kutusuna erişim sağlandığını doğrulayıp hesabın ilgili alanını güncelleyecek.

Bu örnekte doğruladığımız şey kişinin gerçek dünyadaki kimliği değil, **belirli bir anda e-posta kutusuna erişebilmesi**.

Ada kayıt formuna Deniz'in adresini yanlışlıkla yazmış olabilir. Joi bu adresi biçim açısından geçerli bulabilir; ama Ada o adrese gönderilen bağlantıyı açamıyorsa e-postasını doğrulayamaz. Bu nedenle **biçim kontrolü**, **parola doğrulaması** ve **e-posta erişim doğrulaması** üç ayrı soruya cevap verir.

Ada kayıt formuna Deniz'in e-posta adresini yazarsa sunucu düzgün biçimli bir adres görür ama posta kutusunu kimin kullandığını henüz bilemez. **E-posta doğrulaması Ada'nın kimliğini her durumda kanıtlayan bir belge değil**, belirtilen posta kutusuna erişim göstergesidir. Bu yüzden doğrulanmamış hesaba hangi işlemlerin açık olacağına ayrıca karar veriyoruz; doğrulama bayrağını tarayıcının “Ben doğruladım” demesiyle değiştiremeyiz.

## User Modeline Bir Alan Ekleyelim

5. bölümde oluşturduğumuz `src/db/models/user.js` dosyasındaki mevcut User şemasına şunu ekleyin:

```js
isEmailVerified: {
  type: Boolean,
  default: false,
},
```

## Örnek 2

Yeni kayıtta bu değer `false` (doğrulanmamış) olacak. Gerçek doğrulama tamamlandığında `true` (doğrulanmış) hâline getireceğiz.

**Eski hesaplara dikkat:** Şemaya `default: false` eklemek, MongoDB'deki eski User belgelerinin hepsini kendiliğinden güncellediğimiz anlamına gelmez. Uygulama karar verirken yalnızca açıkça `true` olan değeri doğrulanmış kabul edecek; gerekiyorsa mevcut hesaplar için ayrıca geçiş planlayacağız.

## Ada Hesabını Kullanabilecek mi?

Bu, uygulamanın ürün kararı. Biz Movie API'de şu yolu seçiyoruz:

```text
Ada kaydolabilir ve giriş yapabilir.
Profilini görebilir.
Bazı içerik oluşturma işlemleri için e-posta doğrulaması istenebilir.
```

## Örnek 3

Böylece hesabı açar açmaz Ada'yı her yerden dışlamıyoruz. Ancak e-posta erişimini doğrulamadan hassas bazı işlemlere izin vermeme seçeneğimiz oluyor.

Önce Movie API’nin e-posta adresi doğrulanmış hesapları nasıl ayıracağını kuracağız. Bunun için kullanıcı kaydında doğrulama durumunu tutmalı ve gerekli işlemlerden önce bu durumu kontrol etmeliyiz. Ada’ya gönderilecek bağlantının belirtecini 45. bölümde, bağlantı kullanıldığında hesabın nasıl doğrulanacağını ise 46. bölümde geliştireceğiz.

## Doğrulanmış Hesabı Kontrol Eden Ara Katman

Yeni dosya: `src/middlewares/requireVerifiedEmail.js`

```js
export const requireVerifiedEmail = (req, res, next) => {
  if (req.user?.isEmailVerified !== true) {
    const error = new Error(
      "Bu işlem için e-posta doğrulaması gerekli.",
    );
    error.status = 403;
    return next(error);
  }

  return next();
};
```

## Örnek 4

Bu ara katman (middleware) yalnızca `req.user` değerini kontrol ediyor. Kullanıcının kim olduğunu belirleyen `authenticate` **önce** çalışmalı. 35. bölümde `authenticate` kullanıcıyı veritabanından okuduğu için güncel `isEmailVerified` alanını da görebiliyor; yalnız JWT içindeki eski bir bilgiye güvenmiyoruz.

## Henüz E-posta Göndermeden Kontrolü Deneyelim

`src/routers/users.js` dosyasına şu import'u ekleyin:

```js
import { requireVerifiedEmail } from "../middlewares/requireVerifiedEmail.js";
```

## Örnek 5

Test amacıyla aşağıdaki yolu ekleyin:

```js
router.get(
  "/me/verification-check",
  authenticate,
  requireVerifiedEmail,
  (req, res) => res.status(200).json({ message: "E-posta doğrulandı." }),
);
```
