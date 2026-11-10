# Bölüm 48 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# Parola Sıfırlama Belirtecini Nasıl Güvenli Saklarız?


## Parola Sıfırlama Bağlantısındaki Sırrı Nasıl Saklarız?

Parola sıfırlama isteğini aldık, ancak kullanıcıya göndereceğimiz bağlantının içine güvenilir bir doğrulama değeri koymadan yeni parola belirletemeyiz. E-posta doğrulamasındaki ilkeyi burada da uygulayacağız: **ham belirteç Ada'ya gönderilir, MongoDB'de ise ondan hesaplanan `tokenHash` değeri saklanır.** Süre ve tek kullanımlılık bu kayıt için de ayrı ayrı denetlenecek.

## Doğrulama Bağlantısıyla Aynı Değer Değil

Ada e-posta doğrulama bağlantısını kullanmış olabilir. Fakat bu, aynı bağlantıyla parolasını değiştirebileceği anlamına gelmez. **E-posta doğrulaması** ile **parola sıfırlama (password reset)** iki ayrı izin türüdür.

45. bölümdeki `AccountToken` modelinde bu yüzden `type` alanı vardı. Şimdi `password_reset` türünü kullanacağız. Ham belirteç (raw token), yeni parola belirleme bağlantısında taşınacak; MongoDB'de ise yalnızca `hashToken(rawToken)` ile hesaplanan `tokenHash` değeri saklanacak.

## Sıfırlama Belirtecini Üretelim

46. bölümde oluşturduğumuz `src/services/accountTokens.js` dosyasına, e-posta doğrulama fonksiyonlarını silmeden ekleyin:

```js
const RESET_TOKEN_LIFETIME_MS = 20 * 60 * 1000;

export const issuePasswordResetToken = async (userId) => {
  await AccountToken.updateMany(
    { userId, type: "password_reset", usedAt: null },
    { $set: { usedAt: new Date() } },
  );

  const rawToken = createOpaqueToken();
  await AccountToken.create({
    userId,
    type: "password_reset",
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + RESET_TOKEN_LIFETIME_MS),
  });

  return rawToken;
};
```

## Örnek 2

`AccountToken`, `createOpaqueToken` ve `hashToken` import'ları 46. bölümden beri bu dosyada bulunuyor. `20` dakika burada seçtiğimiz örnek süredir; kendi ürününüzün riskine göre ayarlanmalıdır.

Önemli bir ayrım: Yeni sıfırlama belirteci üretildiğinde eski **parola sıfırlama** belirteçlerini geçersiz kılıyoruz. E-posta doğrulama belirteçlerine dokunmuyoruz. Bir işlemin anahtarı başka bir kapıyı açmamalı.

## Yeni Parola Hangi İstekle Gelecek?

Ada bağlantıya tıkladığında tarayıcı ona yeni parolayı soracak. Parola belirleme işlemini bir `POST` isteği yapacak:

```http
POST /auth/reset-password
Content-Type: application/json
```

## Örnek 3



```json
{
  "token": "epostadaki-ham-deger",
  "password": "yeni-uzun-bir-parola"
}
```

## Örnek 4

Buradaki yeni parola da kayıt sırasındaki kurallara uymalı. `src/validation/auth.js` içine ekleyin:

```js
export const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().required(),
  password: Joi.string().min(15).max(128).required(),
});
```

## Örnek 5

İki yerde aynı parola politikasını koruyoruz; parolanın kendisini `trim()` veya `lowercase()` ile değiştirmiyoruz. İleride kayıt ve reset şemalarının ortak bir password helper kullanması bakım kolaylığı sağlar.

## Tek Kullanım Kuralı

Doğrulama için kullandığımız koşulun bir benzerini burada da kullanacağız:

```js
const filter = {
  tokenHash: hashToken(rawToken),
  type: "password_reset",
  usedAt: null,
  expiresAt: { $gt: new Date() },
};
```
