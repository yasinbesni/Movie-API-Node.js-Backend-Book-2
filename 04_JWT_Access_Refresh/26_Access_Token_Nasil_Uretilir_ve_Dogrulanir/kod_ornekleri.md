# Bölüm 26 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# Access Token (Erişim Belirteci) Nasıl Üretilir ve Doğrulanır?


## İmzalı Belirteci Artık Kodla Üretelim

JWT'nin içine hassas kullanıcı bilgisi koymamaya karar verdik. Şimdi Movie API'de bu kararı uygulayacağız: Ada için gerekli kimlik bilgisini içeren **kısa ömürlü bir access token üretecek**, istek geldiğinde imzasını ve geçerlilik koşullarını denetleyeceğiz. Üretim ve doğrulama iki ayrı iş; bu aşamada mevcut session giriş yolunu değiştirmiyoruz.

## Ada'nın Girişini Her Sunucu Nasıl Doğrulayabilir?

Oturum yönteminde Ada'nın kimliğini MongoDB'deki oturum kaydından buluyorduk. Bunun yanında farklı bir yöntem daha var: Sunucu, Ada'nın kimliğini belirten kısa ömürlü ve **imzalı** bir JWT üretebilir. Başka bir sunucu da doğru anahtarla imzayı kontrol edebilir.

Burada henüz Movie API'mizin çalışan session (oturum) girişini değiştirmeyeceğiz. Önce JWT'nin üretildiğini ve gerçekten doğrulandığını göreceğiz. Böylece iki yöntem birbirine karışmayacak.

## Paketi ve Gizli Anahtarı Hazırlayalım

Movie API'de `src/config/env.js` dosyamız zaten bulunuyor. Şimdi `jsonwebtoken` paketini kuruyoruz:

```bash
npm install jsonwebtoken
```

## Örnek 2

JWT'yi imzalamak için güçlü ve tahmin edilemeyen bir gizli anahtar gerekiyor. Geliştirme ortamı için bir kez rastgele değer üretelim:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

## Örnek 3

Üretilen değeri `.env` dosyasına ekliyoruz:

```dotenv
JWT_ACCESS_SECRET=buraya-uretilen-rastgele-deger
```

## Örnek 4

Bu satırdaki örnek metin gerçek bir anahtar değildir. `.env` dosyasını GitHub'a göndermiyoruz. Mevcut `src/config/env.js` içindeki `env` nesnesine de **yalnızca** şu alanı ekliyoruz:

```js
jwtAccessSecret: getRequiredString("JWT_ACCESS_SECRET"),
```

## Örnek 5

`getRequiredString()` fonksiyonu, gerekli bir ortam değişkeni boşsa uygulamanın açık bir hata vermesini sağlar. JWT anahtarını da aynı yöntemle okuyacağız. Önce `.env` dosyasına ilgili değeri eklediğimiz için uygulama eksik anahtarla başlamayacak.

## İmzayı Controller Değil, Yardımcı Fonksiyon Üretsin

`src/utils/token.js` dosyasını oluşturuyoruz:

```js
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const createAccessToken = (userId) =>
  jwt.sign(
    { sub: userId },
    env.jwtAccessSecret,
    {
      algorithm: "HS256",
      expiresIn: "15m",
    },
  );

export const verifyAccessToken = (token) => {
  const payload = jwt.verify(
    token,
    env.jwtAccessSecret,
    { algorithms: ["HS256"] },
  );

  if (
    !payload ||
    typeof payload !== "object" ||
    typeof payload.sub !== "string" ||
    !payload.sub
  ) {
    throw new Error("Geçersiz erişim belirteci.");
  }

  return payload;
};
```

## Örnek 6

*.

**İmzayı doğrulamak**, token içeriğini yalnızca okumakla aynı şey değildir. `jwt.decode()` bir metni çözümleyebilir; ama bu, o metnin bize ait olduğunu kanıtlamaz. Kimlik kararını `verifyAccessToken()` ile vereceğiz.

`createAccessToken()` ile `verifyAccessToken()` aynı işlemin iki farklı yönüdür. İlkinde Movie API, Ada'nın kullanıcı kimliğini kendi gizli anahtarıyla imzalar. İkincisinde tarayıcıdan gelen metnin imzası, süresi ve kabul edilen kuralları denetlenir. `verifyAccessToken()` yalnızca metni okuyup `sub` değerini almak değildir; **o değere güvenip güvenemeyeceğimize karar verme** adımıdır.

Birinin token'ın `sub` alanını değiştirerek Deniz'in kimliğini yazdığını düşünün. Yalnız metni okusaydık onu Deniz sanabilirdik. İmza doğrulanamadığında ise bu isteği reddederiz. Bu ayrımı korumak, ileride bütün korumalı yolları tek ara katmanda toplamamızı sağlayacak.

## İlk Token'ı Deneyelim

Geliştirme ortamında ayrı bir deneme dosyasıyla şunu çalıştırabiliriz:

Bu küçük denemeyi kalıcı API yolu olarak değil, isterseniz `src/scripts/tryAccessToken.js` adlı **geçici bir deneme dosyasında** çalıştırabilirsiniz. `src/utils/token.js` içindeki fonksiyonları bu dosyadan import ederiz.

```js
import {
  createAccessToken,
  verifyAccessToken,
} from "./src/utils/token.js";

const token = createAccessToken("ornek-user-id");
const payload = verifyAccessToken(token);

console.log(payload.sub); // ornek-user-id
```
