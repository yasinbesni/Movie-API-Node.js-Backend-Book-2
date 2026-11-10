# Bölüm 46 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

a yazdığı e-posta adresine gerçekten erişebildiğini henüz bilmiyor. Bu iş için rastgele **doğrulama belirtecini (verification token)** ve onu tutan `AccountToken` modelini hazırlamıştık.

Ada bağlantıyı yarın açarsa ne olacak? Aynı bağlantıya iki kez tıklarsa? Bir başkası bağlantıyı ele geçirirse?

Bağlantıyı sınırsız süre çalışan ikinci bir parola gibi bırakamayız. Bu yüzden belirteç **30 dakika geçerli** ve **tek kullanımlık** olacak. Süre, projemiz için seçtiğimiz örnek değerdir.

Ada saat 10.00'da doğrulama e-postasını aldıysa ve bağlantı 30 dakika geçerliyse 10.20'de ilk kullanım kabul edilebilir; aynı bağlantı 10.21'de **ikinci kez** kullanıldığında süre henüz bitmemiş olsa da reddedilmelidir. 10.40'taki ilk deneme ise **daha önce kullanılmamış olsa bile** süre nedeniyle reddedilir. Bu iki durum, `expiresAt` ve `usedAt`/tüketim durumunu neden ayrı kontrol ettiğimizi gösterir.

## Bağlantıyı Üretecek Service

E-posta doğrulama belirtecini üretme ve saklama işini Controller'a yüklemek yerine Service katmanında toplayacağız. `AccountToken` modelini `src/db/models/accountToken.js` dosyasında oluşturduk. Şimdi bu modeli kullanacak `src/services/accountTokens.js` dosyasını ekleyin:

```js
import { AccountToken } from "../db/models/accountToken.js";
import {
  createOpaqueToken,
  hashToken,
} from "../utils/token.js";

const EMAIL_TOKEN_LIFETIME_MS = 30 * 60 * 1000;

export const issueEmailVerificationToken = async (userId) => {
  await AccountToken.updateMany(
    { userId, type: "email_verify", usedAt: null },
    { $set: { usedAt: new Date() } },
  );

  const rawToken = createOpaqueToken();
  await AccountToken.create({
    userId,
    type: "email_verify",
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + EMAIL_TOKEN_LIFETIME_MS),
  });

  return rawToken;
};
```

## Örnek 2

`createOpaqueToken()` ve `hashToken()` zaten `src/utils/token.js` içinde bulunuyor. Yeni paket yüklemiyoruz. Ham belirteci yalnızca bağlantıya koymak için döndürüyoruz; veritabanında yalnızca bu belirteçten hesaplanan `tokenHash` değeri tutuluyor.

Buradaki `updateMany()` eski doğrulama bağlantılarını geçersiz kılar. Aynı hesap için eşzamanlı iki yeni bağlantı isteğinin tamamen yarışsız olması ise ek tasarım gerektirir; bu ilk örnekte aynı hesap için istek hızını sınırlayacağız.

## Bağlantı Nasıl Kullanılacak?

Bir güvenlik ayrıntısı var: Bazı e-posta hizmetleri bağlantıları kullanıcıdan önce tarayabilir. Bu yüzden **`GET` isteği yalnız doğrulama sayfasını açacak**. Hesabın durumunu değiştiren işlem ayrı bir `POST` isteği olacak.

```http
POST /auth/verify-email
Content-Type: application/json
```

## Örnek 3



```json
{ "token": "epostadan-gelen-ham-deger" }
```

## Örnek 4

`src/validation/auth.js` dosyasına mevcut şemaları silmeden ekleyin:

```js
export const verifyEmailSchema = Joi.object({
  token: Joi.string().trim().required(),
});
```

## Örnek 5

Doğrulama işlemini `src/services/accountTokens.js` dosyasında sürdürelim:

```js
import { User } from "../db/models/user.js";

export const verifyEmailToken = async (rawToken) => {
  const token = await AccountToken.findOneAndUpdate(
    {
      tokenHash: hashToken(rawToken),
      type: "email_verify",
      usedAt: null,
      expiresAt: { $gt: new Date() },
    },
    { $set: { usedAt: new Date() } },
    { returnDocument: "before" },
  );

  if (!token) {
    const error = new Error("Doğrulama bağlantısı geçersiz veya süresi dolmuş.");
    error.status = 400;
    throw error;
  }

  await User.findByIdAndUpdate(token.userId, {
    $set: { isEmailVerified: true },
  });
};
```

## Örnek 6

Burada `findOneAndUpdate()` koşulu tek bir token'ın eşzamanlı isteklerle iki kez başarıyla tüketilmesini önler. Ancak **token tüketimi ile User güncellemesi iki ayrı veritabanı yazımıdır**. İkincisi başarısız olursa bağlantı tüketilmiş kalabilir. Üretimde bu iki yazımın birlikte tamamlanması için MongoDB transaction (işlem bütünlüğü) kullanılması gerekir; bu konuyu 67. bölümde ayrıntılı işleyeceğiz. Şimdilik bunu gizli bir garanti gibi sunmuyoruz.

`src/controllers/auth.js` içine:

```js
import { verifyEmailToken } from "../services/accountTokens.js";

export const verifyEmailController = async (req, res) => {
  await verifyEmailToken(req.body.token);
  res.status(200).json({ message: "E-posta adresi doğrulandı." });
};
```

## Örnek 7

`src/routers/auth.js` içindeki mevcut `router` üzerinde, import listelerine `verifyEmailController` ve `verifyEmailSchema` ekleyip yolu bağlayın:

```js
router.post(
  "/verify-email",
  validateBody(verifyEmailSchema),
  verifyEmailController,
);
```
