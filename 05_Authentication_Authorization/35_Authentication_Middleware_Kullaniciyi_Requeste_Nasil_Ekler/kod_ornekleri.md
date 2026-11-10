# Bölüm 35 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

teğe Nasıl Ekler?


## Kimlik Doğrulama Her Controller'da Yeniden mi Yapılacak?

Session ve JWT'nin hangi doğrulama adımlarına ihtiyaç duyduğunu artık ayırabiliyoruz. Sıradaki pratik sorun şu: Ada `GET /users/me` istediğinde her Controller token çözümleme, kullanıcı arama ve hata üretme kodunu tekrar mı yazmalı? **Bu ortak işi, Controller çalışmadan önce devreye giren authentication middleware'e** taşıyacağız. Başarılı doğrulamanın sonucunu isteğin üzerinde `req.user` olarak kullanacağız.

## Ada'nın Her İsteğinde Aynı Kontrolleri Tekrarlamayalım

Ada artık JWT girişini kullanabiliyor. Ama kişisel bilgilerini görmek istediğinde Movie API'nin yeni bir sorumluluğu var: Gelen isteğin Ada'ya ait olduğunu doğrulamak.

Bunu her Controller'da tekrar yazmak yerine ortak bir **middleware (ara katman)** içinde toplayacağız. Adını `authenticate` koyacağız.

Ada geçerli çereziyle `/users/me` isteği gönderdiğinde Controller hemen profil bilgisini okumamalı. Önce ara katman çerezi kontrol etmeli, belirteci doğrulamalı ve kullanıcıyı bulmalı. **Bu denetim başarısızsa Controller hiç çalışmamalı.** Bu sıralama, ileride yeni bir korumalı yol eklediğimizde güvenlik kontrolünü yeniden yazmamızı önler.

```text
İstek (Request)
    ↓
Erişim çerezi var mı?
    ↓
JWT imzası ve süresi geçerli mi?
    ↓
Veritabanında kullanıcı bulunuyor mu?
    ↓
req.user = kullanıcı
    ↓
Controller
```

## Örnek 2

Burada erişim JWT'sinin yalnızca imzalı olması yeterli değil: İlgili kullanıcı kaydının hâlâ bulunması da gerekiyor. **Neden her istekte veritabanına bakmayı kabul ediyoruz?** İmza, belirtecin değiştirilmediğini kanıtlar; Ada'nın hesabının sonradan kapatılmadığını veya yetkisinin kaldırılmadığını söylemez. Güncel kullanıcıyı okumak ek sorgu maliyeti getirir, fakat güvenlik kararımızı eski bir token bilgisine mahkûm etmez.

Ada `GET /users/me` istediğinde işlem sırasını takip edin: Router önce `authenticate` çalıştırır; middleware token'ın geçerliliğini kontrol eder, güncel kullanıcıyı bulur ve `req.user` alanını hazırlar. **Ancak bu adımlardan sonra** `getCurrentUser` devreye girer. Token geçersizse Controller'ın “belki yine de profil döneyim” diye ikinci bir yol denemesi olmaz. Bu sıralama, korumalı kaynakta kimlik denetimini atlamamamızın temelidir.

## `authenticate` Ara Katmanını Yazalım

Yeni dosyamız `src/middlewares/authenticate.js`:

```js
import { User } from "../db/models/user.js";
import { verifyAccessToken } from "../utils/token.js";

const unauthorized = () => {
  const error = new Error("Kimlik doğrulaması gerekli.");
  error.status = 401;
  return error;
};

export const authenticate = async (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) return next(unauthorized());

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return next(unauthorized());
  }

  const user = await User.findById(payload.sub);
  if (!user) return next(unauthorized());

  req.user = user;
  return next();
};
```

## Örnek 3

JWT doğrulama işlemini saran `try/catch`, geçersiz token hatasını **bilinçli olarak `401` yanıtına dönüştürmek** için var. Buna karşılık `await User.findById(...)` veritabanı hatası nedeniyle başarısız olursa Express 5, bu `async` middleware'in reddedilen Promise'ini otomatik olarak merkezi hata yöneticisine iletir; ikinci bir `try/catch` ve `next(error)` yazmamıza gerek yok. Kullanıcı kaydı hiç bulunmazsa yine `401` yanıtı veriyoruz. Kullanıcıları devre dışı bırakma alanını ileride eklediğimizde onu da burada kontrol edeceğiz; mevcut modelde öyle bir alan henüz bulunmuyor.

`req.cookies`, 30. bölümde Router'lardan önce eklediğimiz `cookie-parser` sayesinde okunabiliyor. Bu ara katman yalnızca **JWT yolundaki** isteklerde kullanılacak; önceki session middleware'ini silmiyoruz.

## İlk Gerçek Korumalı Yolu Açalım

Daha önce örneklerde gördüğümüz `GET /users/me` yolu **şimdi** oluşturuluyor. Yeni dosya `src/controllers/users.js`:

```js
import { toPublicUser } from "../utils/toPublicUser.js";

export const getCurrentUser = (req, res) => {
  res.status(200).json({ data: toPublicUser(req.user) });
};
```

## Örnek 4

`src/routers/users.js` dosyasını oluşturuyoruz:

```js
import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { getCurrentUser } from "../controllers/users.js";

const router = Router();
router.get("/me", authenticate, getCurrentUser);

export default router;
```

## Örnek 5

Son olarak `src/server.js` içinde, mevcut import'ların yanına şu satırı koyuyoruz:

```js
import usersRouter from "./routers/users.js";
```

## Örnek 6

Ve **`app.use(errorHandler)` satırından önce**, mevcut `/auth` ve `/movies` yollarının yanına şunu ekliyoruz:

```js
app.use("/users", usersRouter);
```
