# Bölüm 49 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

tlarla yönetiliyor. JWT için kuracağımız kontrol, bu kayıtları otomatik olarak kapatmayacak.

Peki sunucu, saldırganın elindeki JWT'nin **daha önce** üretildiğini nasıl anlayacak? Kullanıcı kaydına `authVersion` adlı bir sayaç ekleyeceğiz. Adında “version” geçse de bu sayı **Node.js'in, Express'in veya uygulamanın sürümü değildir**. Ada'nın eski erişim JWT'lerini kabul etmeyi bırakmamız gerektiğinde artırdığımız bir güvenlik sayacıdır.

Saat 10.00'da Ada'nın giriş yaptığını ve sunucunun o sırada JWT'ye `ver: 0` yazdığını düşünelim. Saat 10.05'te parola sıfırlama başarılı olunca kullanıcı kaydındaki `authVersion` değerini `1` yapacağız. Saat 10.06'da eski JWT gönderilirse içindeki `0`, kullanıcı kaydındaki `1` ile eşleşmeyecek ve Movie API isteği `401` ile reddedecek. **JWT'nin kendisini değiştirmiyoruz; onu artık geçerli saymıyoruz.**

Bu karşılaştırma giriş ekranında bir kez değil, **JWT ile korunan her istekte** yapılmalı. Aksi hâlde bazı yollar eski JWT'yi süresi dolana kadar kabul etmeye devam edebilir.

## `authVersion` ile Eski Erişim JWT'lerini Reddetmek

Önce `src/db/models/user.js` dosyasındaki mevcut User şemasına bu alanı ekleyelim. Yeni bir hesapta sayaç `0` ile başlar:

```js
authVersion: {
  type: Number,
  default: 0,
},
```

## Örnek 2

Parola sıfırlama sırasında bu sayıyı `1` artıracağız; başka bir güvenlik olayında da gerektiğinde artırabiliriz. Şimdi access token üreten fonksiyonun bu sayıyı JWT'ye yazmasını sağlayalım.

`src/utils/token.js` içindeki **mevcut** `createAccessToken` fonksiyonunu aşağıdaki kodla değiştirin. Aynı dosyada iki ayrı `createAccessToken` bırakmayın:

```js
export const createAccessToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), ver: user.authVersion ?? 0 },
    env.jwtAccessSecret,
    { algorithm: "HS256", expiresIn: "15m" },
  );
```

## Örnek 3

hAccessToken()`: Geçerli bir yenileme belirteciyle **yeni access token alındığında** JWT üretilir.
- `src/services/auth.js` → `rotateRefreshToken()`: Yenileme belirteci değiştirilirken **yeni access token da oluşturulduğunda** JWT üretilir.

Bu üç yerdeki `createAccessToken(user._id.toString())` çağrılarını **`createAccessToken(user)`** olarak değiştirin. Fonksiyonun yeni hâli `sub` alanına yine kullanıcı kimliğini, `ver` alanına ise JWT oluşturulduğu andaki sayacı koyuyor. **Fonksiyona kullanıcı belgesini vermek, belgedeki parola hash'i veya e-posta gibi bütün bilgileri JWT'ye koymak demek değildir:** Kodun imzaladığı içerikte yalnızca `sub` ve `ver` alanlarını açıkça seçiyoruz. Örneğin Ada'nın güncel sayacı `1` ise yeni JWT'nin içindeki değer de `ver: 1` olacak. `jwt` ve `env` import'ları dosyada zaten bulunuyor; tekrar eklemeyin.

Peki **eski JWT'nin içindeki `ver: 0`** ile ne zaman karşılaştırma yapacağız? Ada giriş yaptıktan sonra film kaydı istemek gibi korumalı bir işlem gerçekleştirdiğinde. `src/middlewares/authenticate.js` dosyasında, JWT'nin imzası ve süresi denetlendikten ve User kaydı veritabanından bulunduktan sonra, `req.user` atamasının **önüne** şu kontrolü ekleyin:

```js
if (payload.ver !== (user.authVersion ?? 0)) {
  return next(unauthorized());
}
```

## Örnek 4

ezse Ada ikinci kez deneyemez. Ya da parola değişir fakat eski yenileme belirteçleri iptal edilemezse, başka cihazdaki eski giriş yeni JWT almayı sürdürebilir. İkisi de güvenli bir sonuç değil.

MongoDB'nin **transaction (işlem bütünlüğü)** özelliğini bu yüzden kullanacağız: Birlikte yapılmasını istediğimiz veritabanı yazımları ya tamamı başarılı olduğunda kalıcı olur ya da biri başarısızsa geri alınır. Bu garanti, yalnızca aynı transaction'a dahil edilen veritabanı işlemleri için geçerlidir; tarayıcıya verilen HTTP yanıtının ulaşacağını garanti etmez. Kullanılan MongoDB dağıtımının transaction desteklemesi gerekir. Mekanizmanın ayrıntılarını 67. bölümde inceleyeceğiz.

Burada bir sınır daha var: Parola sıfırlamayla **aynı anda** başka bir cihazın başlattığı token yenileme isteği için ayrıca eşzamanlılık denetimi gerekir. Transaction, kendi içindeki yazımları korur; başka bir isteğin hangi anda yeni token ürettiğini tek başına denetlemez. Bu nedenle eski yenileme haklarının iptalini canlı sistemde eşzamanlı yenileme senaryolarıyla da test etmeliyiz.

`src/services/auth.js` dosyasında var olan import'ları silmeden, eksik olanları ekleyin ve şu `resetPassword` fonksiyonunu oluşturun:

```js
import mongoose from "mongoose";
import { AccountToken } from "../db/models/accountToken.js";
import { RefreshToken } from "../db/models/refreshToken.js";
import { hashToken } from "../utils/token.js";
import { hashPassword } from "../utils/password.js";

export const resetPassword = async (rawToken, password) => {
  // Hash işlemini transaction başlamadan tamamlıyoruz.
  const passwordHash = await hashPassword(password);

  await mongoose.connection.transaction(async (session) => {
    const token = await AccountToken.findOneAndUpdate(
      {
        tokenHash: hashToken(rawToken),
        type: "password_reset",
        usedAt: null,
        expiresAt: { $gt: new Date() },
      },
      { $set: { usedAt: new Date() } },
      { returnDocument: "before", session },
    );

    if (!token) {
      const error = new Error("Bağlantı geçersiz veya süresi dolmuş.");
      error.status = 400;
      throw error;
    }

    const user = await User.findByIdAndUpdate(
      token.userId,
      {
        $set: { passwordHash },
        $inc: { authVersion: 1 },
      },
      { returnDocument: "after", session },
    );
    if (!user) throw new Error("Kullanıcı kaydı bulunamadı.");

    await RefreshToken.updateMany(
      { userId: token.userId, revokedAt: null },
      { $set: { revokedAt: new Date() } },
      { session },
    );
  });
};
```

## Örnek 5

Kodun iki satırına özellikle dikkat edin. `$inc: { authVersion: 1 }`, **Ada'nın eski JWT'lerini reddetmek için gereken sayacı artırır**. `RefreshToken.updateMany()` ise Ada'nın henüz iptal edilmemiş yenileme kayıtlarına `revokedAt` yazar. Yani saldırganın eski access token'ı sonraki korumalı istekte reddedilecek; eski refresh token'ı da yeni bir JWT üretmek için kullanılamayacak.

`User` modelini dosyada zaten import ettiyseniz ikinci kez eklemeyin. Parola hash'ini transaction başlamadan hesaplıyoruz. Veritabanı sürücüsü belirli hatalarda transaction'ı yeniden deneyebileceğinden, bu işlem bloğuna e-posta gönderimi veya başka dış API çağrısı yerleştirmiyoruz; yoksa tekrarlanan denemeler aynı dış işlemi birden fazla kez tetikleyebilir.

Şimdi Ada'nın parola sıfırlama isteğine yanıt veren Controller'ı ekleyelim. `src/controllers/auth.js` dosyasına:

```js
export const resetPasswordController = async (req, res) => {
  await resetPassword(req.body.token, req.body.password);
  res.status(200).json({ message: "Parola güncellendi. Yeniden giriş yapın." });
};
```
