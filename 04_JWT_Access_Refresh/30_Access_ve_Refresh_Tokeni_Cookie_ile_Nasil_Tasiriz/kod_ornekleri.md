# Bölüm 30 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

luna gidip yeni bir erişim belirteci isteyebilir. **Bu iki çerez aynı iş için kullanılmaz:** Kısa ömürlü olan sık gelen korumalı istekler içindir; uzun ömürlü olan yalnız yeni erişim hakkı almaya yarar.

Ada korumalı bir kullanıcı kaynağına eriştiğinde tarayıcısının her seferinde yedi gün geçerli yenileme belirtecini de taşımasını istemiyoruz. Film kataloğunun herkese açık olan `GET /movies` yolu ise giriş gerektirmez. Biri **sık kullanılan kısa süreli erişim**, öteki **daha seyrek kullanılan yenileme hakkı**. Çerezlerin `Path` alanlarını ayırma kararımız bu ihtiyaca dayanıyor.

![Erişim ve yenileme çerezlerinin farklı istek kapsamları](../assets/diagrams/30-token-cerez-kapsamlari.svg)

Refresh token'ın sıradan bir `/movies` isteğine eklenmemesini `Path=/auth` sağlar. **Bu bir taşıma kuralıdır, tek başına kimlik doğrulama veya saldırıya karşı tam koruma değildir.** Sunucunun yalnız yenileme yolunda refresh token'ı kabul etmesi, ayrıca gereken CSRF ve diğer istek güvenliği kontrollerini uygulaması gerekir. Bir saldırgan token'ın ham değerini başka bir yoldan elde ederse çerez yolu onu geçersiz kılmaz.

## Cookie Ayarlarını Tek Yerde Tutalım

`src/utils/authCookies.js` oluşturuyoruz:

```js
import { env } from "../config/env.js";

const isProduction = env.nodeEnv === "production";

const baseOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
};

export const accessCookieOptions = {
  ...baseOptions,
  path: "/",
  maxAge: 15 * 60 * 1000,
};

export const refreshCookieOptions = {
  ...baseOptions,
  path: "/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const setAuthCookies = (
  res,
  accessToken,
  refreshToken,
) => {
  res.cookie("accessToken", accessToken, accessCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);
};

export const clearAuthCookies = (res) => {
  const { maxAge: _a, ...accessClear } = accessCookieOptions;
  const { maxAge: _r, ...refreshClear } = refreshCookieOptions;

  res.clearCookie("accessToken", accessClear);
  res.clearCookie("refreshToken", refreshClear);
};
```

## Örnek 2

`clearAuthCookies()` içindeki iki satıra yakından bakalım. Ada çıkış yaptığında tarayıcıya "bu çerezleri kaldır" demek istiyoruz. Çerezleri oluştururken kullandığımız `maxAge` değerini silme işlemine aynen taşımak yerine, diğer ayarları koruyan yeni nesneler hazırlıyoruz:

Buradaki nesne parçalama örneği, `src/utils/authCookies.js` içinde tanımladığımız çerez seçeneklerini anlamak içindir; tek başına yeni bir dosya oluşturmaz.

```js
const { maxAge: _a, ...accessClear } = accessCookieOptions;
const { maxAge: _r, ...refreshClear } = refreshCookieOptions;
```

## Örnek 3

kendi amacına göre** doğrulamalıdır.

`HttpOnly` çerezin değerini sayfadaki JavaScript'in doğrudan okumasını engeller; XSS ve CSRF'yi tek başına çözmez. Burada bir ayarın **ne yaptığını** bilmek kadar **ne yapmadığını** bilmek de önemlidir.

Ada'nın isteğini gerçek URL'lerle takip edelim: `/users/me` isteğinde tarayıcı `Path=/` kapsamındaki access çerezini gönderebilir; refresh çerezinin `/auth` kapsamı ise onu bu isteğin dışında tutar. `/auth/refresh` isteğinde her iki yol kapsamı da eşleşebilir, fakat sunucu **yenileme kararı için yalnız refresh token'ı** kullanmalıdır. `Path` çerezin nereye gönderildiğini belirler, içerideki token'ın nerede kabul edildiğini tek başına belirlemez. Bu iki kuralı birbiriyle karıştırırsak hem gereksiz veri taşır hem de yanlış endpoint'te yanlış belirteci kabul edebiliriz.

## Çalışan Login'i Silmeyeceğiz

Önemli bir karar: 22. bölümden beri çalışan `POST /auth/login`, MongoDB'de tutulan session (oturum) yöntemiyle çalışmaya **devam ediyor**. JWT'yi denemek için ayrı bir yol ekleyeceğiz: `POST /auth/jwt/login`.

`src/controllers/auth.js` içinde mevcut `registerUser`, `loginUser`, `logoutUser` fonksiyonlarını koruyup şu import ve fonksiyonu ekliyoruz:

```js
import { createAccessToken } from "../utils/token.js";
import { setAuthCookies } from "../utils/authCookies.js";

export const loginUserWithToken = async (req, res) => {
  const user = await authService.loginUser(req.body);

  const accessToken = createAccessToken(
    user._id.toString(),
  );
  const refreshToken = await authService.issueRefreshToken(
    user._id,
  );

  setAuthCookies(res, accessToken, refreshToken);

  res.status(200).json({
    message: "Giriş başarılı.",
    data: toPublicUser(user),
  });
};
```

## Örnek 4

Bu iki yeni import'u mevcut dosyaya ekliyoruz; `authService` ve `toPublicUser` önceki bölümlerden zaten geliyor. Aynı modülü tekrar import etmeye gerek yok.

**Yeni giriş yolu ne yapıyor?** Önce önceki session girişinde olduğu gibi Ada'nın parolasını `authService.loginUser()` doğruluyor. Ardından kısa ömürlü access token üretiliyor, veritabanına bağlı bir refresh token oluşturuluyor ve **ikisinin çerezi de aynı başarılı yanıtla** tarayıcıya gönderiliyor. Bu yüzden JWT için parolayı yeniden doğrulayan ayrı bir servis yazmadık; yalnızca **başarılı girişin sonrasını** değiştirdik.

`src/routers/auth.js` içindeki mevcut login yolunu değiştirmeden Controller import listesine `loginUserWithToken` adını ekliyoruz ve aynı Joi şemasını kullanıyoruz:

```js
router.post(
  "/jwt/login",
  validateBody(loginUserSchema),
  loginUserWithToken,
);
```

## Örnek 5

Router `src/server.js` içinde `/auth` altına bağlandığı için gerçek adresimiz `POST /auth/jwt/login` olur. Session yaklaşımı ile JWT yaklaşımı aynı projede karşılaştırılabilir; uygulamada hangisinin kullanılacağı daha sonra verilecek mimari karardır.

## Gelen Cookie'yi Nasıl Okuyacağız?

Express'te `req.cookies` otomatik olarak oluşmaz. Şimdi `cookie-parser` ekliyoruz:

```bash
npm install cookie-parser
```

## Örnek 6

`src/server.js` içine:

```js
import cookieParser from "cookie-parser";

app.use(cookieParser());
```

## Örnek 7

`app.use(cookieParser())` satırını **`app.use("/auth", authRouter)` satırından önce** yerleştiriyoruz; ikinci bir Express uygulaması oluşturmuyoruz. İleride yenileme isteğinde `req.cookies.refreshToken` değerini böyle okuyacağız.

**Bir sorunla karşılaşırsanız:** [Sorun Giderme Rehberi — SG-14](../09_Ekler/01_Sorun_Giderme_Rehberi.md#sg-14).

## İki Çerezi Nasıl Kontrol Ederiz?

Test hesabıyla `POST /auth/jwt/login` isteğini gönderdiğimizde yanıtta iki `Set-Cookie` başlığı bekleriz:

```text
accessToken  → Path=/      → yaklaşık 15 dakika
refreshToken → Path=/auth  → yaklaşık 7 gün
```
