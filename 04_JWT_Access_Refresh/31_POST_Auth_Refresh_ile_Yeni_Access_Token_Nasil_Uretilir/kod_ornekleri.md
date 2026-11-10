# Bölüm 31 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

ptal edilebilmesine duyduğumuz ihtiyacı artırır.

R1 için MongoDB'de kayıt bulunmuş olsun. Bu tek başına Ada'ya yeni erişim vermeye yetmez: R1 süresi dolmuş olabilir, iptal edilmiş olabilir veya bağlı olduğu kullanıcı artık aktif olmayabilir. Yenileme endpoint'inin kontrolü, **bir kayıt bulundu** sonucuyla değil, bütün koşullar sağlandığında tamamlanır. Bir koşul başarısızsa yeni access token üretmek yerine reddetmek gerekir. Böylece access token'ın süresi dolduğunda parolasız devam etme kolaylığını, koşulsuz erişim hakkına dönüştürmemiş oluruz.

Bu bölümde ilk çalışan yenileme yolunu kurarken **aynı refresh token tekrar kullanılabilir** durumda kalacak. Dolayısıyla çalınmış bir refresh token'ın istismarını yalnız bu kodla tespit edemeyiz. Sonraki aşamada her yenilemede eskisini tüketen rotation mekanizması ekleyeceğiz.

## Ada Filmlerine Geri Döndüğünde

Ada'nın access token'ı sona erdiğinde korumalı bir API isteği `401 Unauthorized` yanıtı verebilir. İstemci, yenileme hakkı hâlâ sürüyorsa ayrı bir istekle yeni access token alabilir. Sunucu çerezin varlığına değil, **arkasındaki kayıt ve geçerlilik kontrollerine** güvenir.

Şimdi yalnızca bu ihtiyacı karşılayan yolu oluşturacağız:

```http
POST /auth/refresh
```

## Örnek 2

ister ve reddedilir; sonra **geçerli R1'i** `/auth/refresh` yoluna gönderir ve yeni access token alır; son olarak yeni access token ile korumalı isteği tekrarlar. Burada **ilk istek reddedildiği için hesabı kapanmış sayılmıyor**; yalnızca o istekte sunulan erişim belirteci geçerli değil. Yenileme isteği, R1 bulunamadığı, süresi dolduğu veya iptal edildiği için **`401 Unauthorized` ile reddedilirse**, Ada artık bu yenileme hakkıyla yeni access token alamaz. İstemci, korumalı işlemlere devam edebilmesi için **Ada’dan yeniden giriş yapmasını istemelidir**. Buna karşılık internet bağlantısı kesilmişse veya sunucu geçici bir hata vermişse, bu durum R1’in geçersiz olduğu anlamına gelmez; Ada’yı hemen çıkışa zorlamak yerine hatayı bildirip yeniden deneme imkânı sunmalıyız. **Yeniden giriş ekranına yönlendirmeyi bu bölümdeki API kodu kendiliğinden yapmaz; bunu istemcide ayrıca uygulamamız gerekir.**

## Service: Kaydı Bulalım, Hakkı Doğrulayalım

`src/services/auth.js` dosyasına önceki fonksiyonları silmeden şu fonksiyonu ekliyoruz. `User`, `RefreshToken`, `hashToken` ve `createAccessToken` önceki bölümlerde kullandığımız import'lardan gelir; eksik olanları dosyanın üstüne bir kez ekleyin.

```js
const throwUnauthorized = () => {
  const error = new Error("Oturum yenilenemedi.");
  error.status = 401;
  throw error;
};

export const refreshAccessToken = async (rawToken) => {
  const tokenHash = hashToken(rawToken);

  const storedToken = await RefreshToken.findOne({ tokenHash });
  if (
    !storedToken ||
    storedToken.revokedAt ||
    storedToken.expiresAt <= new Date()
  ) {
    throwUnauthorized();
  }

  const user = await User.findById(storedToken.userId);
  if (!user) {
    throwUnauthorized();
  }

  return {
    accessToken: createAccessToken(user._id.toString()),
    user,
  };
};
```

## Örnek 3

Bu kontrol, yenileme belirtecinin veritabanında bulunmasına ek olarak iptal edilip edilmediğini ve süresinin dolup dolmadığını sınar. Hesap sonradan silinmişse de yeni erişim belirteci üretmeyiz. İleride hesaba *devre dışı* durumu eklediğimizde onu da aynı noktada kontrol edeceğiz; şu anki User modelimizde böyle bir alan henüz yok.

`throwUnauthorized()` yalnızca bu dosyada kullandığımız küçük bir yardımcıdır; merkezi hata yöneticimiz 10. bölümden beri `error.status = 401` değerini HTTP yanıtına çevirebiliyor. Kaydı bulunamayan veya süresi dolan bir belirteç için ayrıntılı bilgi döndürmüyoruz.

## Controller: Çereze Yeni Değeri Yazalım

`src/controllers/auth.js` dosyasında diğer Controller'ları koruyarak şu fonksiyonu ekliyoruz:

```js
import { accessCookieOptions } from "../utils/authCookies.js";

export const refreshSession = async (req, res) => {
  const rawToken = req.cookies?.refreshToken;
  if (!rawToken) {
    const error = new Error("Oturum yenilenemedi.");
    error.status = 401;
    throw error;
  }

  const { accessToken, user } =
    await authService.refreshAccessToken(rawToken);

  res.cookie("accessToken", accessToken, accessCookieOptions);
  res.status(200).json({ data: toPublicUser(user) });
};
```

## Örnek 4

`authService` ve `toPublicUser` bu dosyada 13. bölümden beri mevcut. `accessCookieOptions` da 30. bölümde hazırladığımız yardımcı dosyadan geliyor. Yeni import'u mevcut import grubuna ekleyin; aynı dosyayı yeniden oluşturmuyoruz.

`src/routers/auth.js` içinde Controller import listesine `refreshSession` adını ve Router'a şu yolu ekleyelim:

Bu Route satırını mevcut `src/routers/auth.js` dosyasına, diğer `/auth` yollarının yanına ekleyin.

```js
router.post("/refresh", refreshSession);
```
