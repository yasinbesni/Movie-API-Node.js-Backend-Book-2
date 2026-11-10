# Bölüm 21 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

yor. Her şey normal görünüyor.

Ama bir sorun var: Arayüzün giriş ekranını göstermesi, sunucunun Ada'nın oturumunu kapattığı anlamına gelmiyor. Tarayıcıda oturum çerezi (**session cookie**) duruyorsa sonraki istekte yeniden gönderilebilir.

Tarayıcıdaki `sid` çerezi, MongoDB'de saklanan oturum kaydını bulmaya yarar. Bu nedenle güvenli bir çıkış için iki şey gerekir: **MongoDB'deki oturum kaydının silinmesi ve tarayıcıya çerezi temizlemesinin söylenmesi.**

Yalnızca React tarafında `setUser(null)` yazmak görünümü değiştirir; oturumu sonlandırmaz.

**Güvenli çıkış, yalnızca ekrandaki görünümü değiştirmek değil, eski oturum kimliğinin yeniden kullanılmasını engellemektir.**

## Mevcut Controller'a Çıkış İşlemini Ekleyelim

Giriş ve kayıt işlemlerinin bulunduğu `src/controllers/auth.js` dosyasına şimdi `logoutUser` fonksiyonunu ekleyeceğiz; mevcut `registerUser` ve `loginUser` fonksiyonları yerinde kalacak.

Uygulamamız çerez için geliştirme ortamında `sid`, üretim ortamında `__Host-sid` adını kullanıyor. Girişte oluşturulan çerezin çıkışta doğru temizlenebilmesi için sunucu ve çıkış Controller'ı **aynı çerez adını** kullanmalı.

Önce `src/utils/sessionCookie.js` dosyasını oluşturalım:

```js
import { env } from "../config/env.js";

export const isProduction = env.nodeEnv === "production";

export const sessionCookieName = isProduction
  ? "__Host-sid"
  : "sid";
```

## Örnek 2

Şimdi `src/server.js` de bu ortak tanımları kullansın. Dosyanın import bölümüne şunları ekleyin:

```js
import {
  isProduction,
  sessionCookieName,
} from "./utils/sessionCookie.js";
```

## Örnek 3

`src/server.js` içindeki eski `const isProduction = env.nodeEnv === "production";` satırını kaldırın; aynı değişken artık yardımcı dosyadan geliyor. Mevcut `session({...})` ayarındaki `name` değerini `sessionCookieName`, `cookie.secure` değerini `isProduction` olarak değiştirin. **İkinci bir session middleware eklemiyoruz.** Böylece sunucu ile çıkış Controller'ı aynı çerez adını kullanacak.

Şimdi `src/controllers/auth.js` dosyasında mevcut import'ların yanına şunu ekleyin:

```js
import {
  isProduction,
  sessionCookieName,
} from "../utils/sessionCookie.js";
```

## Örnek 4

Ardından fonksiyonu ekleyelim:

```js
export const logoutUser = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    res.clearCookie(sessionCookieName, {
      path: "/",
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
    });

    return res.status(204).send();
  });
};
```

## Örnek 5

mına gelmez. Express'in isteği sonraki uygun middleware'e veya hata işleyicisine devretmek için sunduğu fonksiyondur. `next(error)` çağrısında ise hata işleme akışı devreye girer. Böylece veritabanındaki silme hatasını, kullanıcıya başarılı çıkış yapılmış gibi göstermemiş oluruz.

Bu çıkış işleminde **iki ayrı yerde** çalışıyoruz. `destroy()` MongoDB'deki o oturum kaydını silmeye çalışır; yani eski `sid` daha sonra yeniden gönderilse bile kullanıcının oturumu bulunmamalıdır. `clearCookie()` ise tarayıcının `sid` çerezini kaldırmasını ister. Yalnızca çerezi silseydik, değeri önceden kopyalanmış bir oturum hâlâ geçerli kalabilirdi. Yalnızca veritabanı kaydını silseydik, tarayıcı artık işe yaramayan çerezi taşımayı sürdürebilirdi.

`clearCookie()` çağrısında çerezin **adı ve `Path` kapsamı** oluşturulurken kullanılan değerlerle eşleşmelidir. Ortak yardımcı dosya, çerez adının farklı yerlerde yanlışlıkla farklı yazılmasını önler.

`204 No Content`, başarılı işlemden sonra ayrıca bir JSON gövdesi göndermeyeceğimizi ifade eder.

## Router'da Bir Yol Açalım

`src/routers/auth.js` içindeki Controller import'una `logoutUser` ekleyin; mevcut register ve login yolları aynen kalacak. Ardından:

```js
router.post("/logout", logoutUser);
```

## Örnek 6

Router, `src/server.js` içinde `/auth` yoluna bağlandığı için gerçek adres `POST /auth/logout` olur. `POST` seçiyoruz; çünkü çıkış, yalnızca bilgi okumaz, **sunucudaki oturum kaydını değiştirir**. Sırf bir bağlantıya tıklanarak çalışan `GET` isteğiyle bu işlemi tasarlamak istemiyoruz.

Çıkış isteğini yalnızca giriş yapmış kullanıcıya kapatmak yerine, geçerli bir oturum olmasa da çerez temizliğini denemesini istiyoruz. Böylece arayüzdeki oturum bilgisi eskimiş olsa bile kullanıcı çıkış yapabilir. Yine de çıkış, sunucunun durumunu değiştiren bir istektir: Cookie tabanlı sistemlerde **CSRF** korumasını ilerleyen güvenlik bölümünde ayrıca ele alacağız.

## Gerçekten Çıkış Yapıldığını Nasıl Göreceğiz?

Şu anda Movie API'de herkese açık `/movies` yolları bulunuyor. Dolayısıyla çıkıştan sonra `/movies` isteğinin `401` dönmesini beklemek **yanlış bir test** olur. Henüz gerçek bir korumalı profil endpoint'i de eklemedik.

Yerel ortamda yalnızca bu deneme için, `src/server.js` içinde Router'lardan sonra ve `errorHandler`'dan önce geçici bir yol açabilirsiniz:

```js
app.get("/debug/only-logged-in", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      message: "Önce giriş yapmalısınız.",
    });
  }

  return res.status(200).json({
    message: "Oturum geçerli.",
  });
});
```
