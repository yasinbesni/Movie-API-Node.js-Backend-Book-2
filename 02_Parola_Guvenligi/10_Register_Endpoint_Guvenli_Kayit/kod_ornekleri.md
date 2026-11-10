# Bölüm 10 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# POST /auth/register: İlk Kullanıcı Hesabını Güvenli Biçimde Oluşturalım

## Ada Yeniden “Kayıt Ol” Düğmesine Basıyor

Altıncı bölümde Ada'nın gönderdiği bilgileri denetledik. Parolanın neden düz metin saklanamayacağını gördük; ardından Argon2id ile hash üreten modülü hazırladık. Şimdi Ada'nın aynı formu gönderdiğini düşünelim.

Bu kez uygulamamız kayıt işlemini tamamlayabilecek:

```http
POST /auth/register
Content-Type: application/json
```

## Örnek 2



```json
{
  "name": "Ada",
  "email": "ADA@EXAMPLE.COM",
  "password": "uzun-bir-deneme-parolasi"
}
```

## Örnek 3

Başarılı işlem sonunda Ada'nın hesabı oluşacak. Fakat HTTP Response'ta ne gerçek parolası ne de parola hash'i bulunacak.

---

## Var Olan Movie API'yi Genişletiyoruz

Kayıt işlemini Movie API’nin mevcut katmanlarına yerleştireceğiz: `Router` isteği doğru yola yönlendirir, `Controller` HTTP yanıtını hazırlar, `Service` kayıt işlemini yürütür, `Model` ise veritabanındaki kullanıcı kaydıyla çalışır. Böylece yeni bir yapı kurmadan mevcut projeyi genişletiriz.

Aynı düzeni kullanıcı kaydı için kullanacağız:

```text
POST /auth/register
       ↓
Joi doğrulaması
       ↓
Auth Controller
       ↓
Auth Service
       ↓
User Model + hashPassword()
       ↓
MongoDB
```

## Örnek 4

Parçaların sorumluluğu net olursa, daha sonra login ve parola sıfırlama eklendiğinde aynı kodu birbirine karıştırmayız.

---

## Önce Service: Kayıt İşlemini Gerçekleştirelim

Yeni dosyamız:

```text
src/services/auth.js
```

## Örnek 5



```js
import { User } from "../db/models/user.js";
import { hashPassword } from "../utils/password.js";

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("Bu e-posta adresiyle bir hesap zaten var.");
    error.status = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  return user;
};
```

## Örnek 6

Burada üç karar var. Önce e-postanın kullanılıp kullanılmadığına bakıyoruz; Ada'ya hesabın zaten bulunduğunu erken söyleyebiliriz. Fakat bu kontrol tek başına yeterli değil: İki kayıt isteği aynı anda gelirse ikisi de “boş” sonucu görebilir. **Son güvenceyi**, 4. bölümde oluşturduğumuz benzersiz e-posta indeksi sağlar. Ardından gerçek parolayı **saklamadan önce** hash'liyoruz; veritabanına ham parola hiç göndermiyoruz. Son olarak `User.create()` çağrısına yalnızca izin verilen alanları aktarıyoruz; böylece istemcinin gönderdiği `role` gibi beklenmeyen alanlar kayıt kararına karışmıyor.

Daha önceki Joi sözleşmemiz `email` değerini küçük harfli ve boşlukları temizlenmiş biçime dönüştürdüğü için Service'e gelen e-posta da aynı biçimde oluyor.

Bu ayrımı Postman'de aynı e-postayla iki kez kayıt yaparak görebiliriz: Önceden kayıt varsa Service'teki kontrol `409` döndürür; iki kayıt aynı anda yarışırsa veritabanının `11000` hatasını merkezi hata yöneticimiz yine `409` olarak karşılar. **İkisinde de ikinci hesap oluşmaması için benzersiz indeksin gerçekten kurulmuş olması gerekir.**

---

## Controller: Dışarıya Hangi Bilgiyi Göstereceğiz?

Yeni dosya:

```text
src/controllers/auth.js
```

## Örnek 7



```js
import * as authService from "../services/auth.js";

export const registerUser = async (req, res) => {
  const user = await authService.registerUser(req.body);

  return res.status(201).json({
    message: "Kullanıcı oluşturuldu.",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
};
```

## Örnek 8

`User.create()` sonucunda dönen Mongoose belgesinde `passwordHash` bulunabilir. Modelde `select: false` kullanmış olmamız, **yeni oluşturulmuş bir belgeyi olduğu gibi Response'a göndermeyi güvenli kılmaz**.

Bu yüzden sadece göndermek istediğimiz alanları seçiyoruz. Ada'nın profilini oluşturduk; fakat kendisine parola hash'ini göstermemiz gerekmiyor.

`201 Created`, yeni bir kaynak oluşturulduğunu ifade eder.

---

## Router: Yeni Yolu Bağlayalım

Yeni dosyamız:

```text
src/routers/auth.js
```

## Örnek 9



```js
import { Router } from "express";

import { registerUser } from "../controllers/auth.js";
import { validateBody } from "../middlewares/validateBody.js";
import { registerUserSchema } from "../validation/auth.js";

const router = Router();

router.post(
  "/register",
  validateBody(registerUserSchema),
  registerUser,
);

export default router;
```

## Örnek 10

Joi doğrulamasını Controller'dan **önce** çalıştırıyoruz. Eksik, geçersiz veya izin verilmeyen alanlar bu aşamada `400` yanıtıyla geri dönecek; kayıt işlemi başlamayacak.

Movie API’nin mevcut `src/server.js` dosyasına da Router’ı bağlayalım. Mevcut import'ların yanına:

```js
import authRouter from "./routers/auth.js";
```

## Örnek 11

`app.use("/movies", moviesRouter);` satırının yakınına, **`app.use(errorHandler)` satırından önce** şu satırı ekleyin:

```js
app.use("/auth", authRouter);
```

## Örnek 12

Böylece `POST /auth/register` yolu açılır. `express.json()` ve diğer mevcut middleware'lerimiz çalışmayı sürdürür. Mevcut `/movies` endpoint'lerinin davranışını değiştirmedik.

---

## Kayıt Hatalarını Doğru HTTP Yanıtına Dönüştürelim

Mevcut `src/middlewares/errorHandler.js` dosyamız MongoDB’nin `11000` kodunu `409` olarak ele alıyor; ancak Service içinde oluşturduğumuz `error.status = 409` değerini **henüz okumuyor**. Bu durumda aynı e-postayı ikinci kez giren Ada için beklediğimiz `409` yerine `500` dönebilir.

Çözüm, mevcut hata yöneticisini baştan yazmak değil. `src/middlewares/errorHandler.js` içindeki MongoDB `11000` ve Mongoose `ValidationError` kontrollerinden **sonra**, en sondaki genel `500` yanıtından **önce** şu koşulu ekleyin:

```js
if (
  Number.isInteger(error.status) &&
  error.status >= 400 &&
  error.status < 500
) {
  return res.status(error.status).json({
    message: error.message,
  });
}
```

## Örnek 13

401` gibi bilinçli hata yanıtları üreteceğiz.

**Express 5 ile asenkron hataları iletme biçimimiz kolaylaştı.** Express 4’te, `async` bir Controller içindeki hatanın merkezi hata yöneticisine ulaşması için genellikle `try/catch` ile `next(error)` çağırır veya bu işi yapan ayrı bir yardımcı kullanırdık. **Express 5, Controller’ın döndürdüğü Promise hata nedeniyle reddedildiğinde bu aktarımı kendisi yapıyor.**

Ada, daha önce kayıtlı olan e-posta adresiyle yeniden hesap açmak istediğinde Service, `error.status = 409` değerini belirleyip `throw error` çalıştırıyor. Controller bu Service fonksiyonunu `await` ile beklediği için hata Controller’ın `async` işleminin de başarısız tamamlanmasına yol açıyor. **Express 5 hatayı otomatik olarak merkezi `errorHandler` middleware’ine iletiyor; orada eklediğimiz kontrol de Ada’ya `409 Conflict` yanıtını gönderiyor.**

Bu nedenle **yalnızca hatayı iletmek amacıyla** Controller’a ayrıca `try/catch` eklememize gerek yok. Bir hatayı özel olarak karşılamak veya farklı bir hataya dönüştürmek istediğimizde ise `try/catch` hâlâ kullanılabilir.

---

## Ada'nın İlk Başarılı Kaydı

Movie API'yi yerel test veritabanıyla başlatın. Postman'den istek gönderin:

```http
POST http://localhost:3000/auth/register
Content-Type: application/json
```

## Örnek 14



```json
{
  "name": "Ada",
  "email": "ADA@EXAMPLE.COM",
  "password": "uzun-bir-deneme-parolasi"
}
```

## Örnek 15

Sunucuyu kendi `PORT` ayarınıza göre başlattıysanız URL'deki portu ona göre kullanın. Beklenen yanıtın biçimi:

```json
{
  "message": "Kullanıcı oluşturuldu.",
  "data": {
    "id": "...",
    "name": "Ada",
    "email": "ada@example.com",
    "createdAt": "..."
  }
}
```

## Örnek 16

Status: `201 Created`.

Şimdi ikinci bir istek gönderin; bu kez aynı e-postayı kullanın. Beklenen yanıt `409 Conflict` olacaktır. Ardından isteğe `"role": "admin"` eklemeyi deneyin: Joi sözleşmesinin bu alanı reddetmesi ve `400` dönmesi gerekir.

Son olarak test veritabanındaki Ada kaydına bakın. `passwordHash` değeri `$argon2id$...` ile başlayan bir formatta olmalı; **gönderdiğiniz gerçek parola veritabanında bulunmamalı**. HTTP yanıtı da `password` veya `passwordHash` içermemeli.

Bu denemeler için gerçek kullanıcı verileriyle çalışan bir veritabanı kullanmayın.

---

## Hesap Açıldı. Peki Ada Giriş Yapmış Sayılır mı?

Şimdilik hayır. Ada için bir kullanıcı kaydı oluşturduk; ama sonraki isteğin onun hesabından geldiğini kanıtlayan bir oturum veya token henüz üretmedik.

```text
Kayıt isteği → User hesabı oluşturuldu
Sonraki istek → Hangi hesap gönderdi, hâlâ bilmiyoruz
```
