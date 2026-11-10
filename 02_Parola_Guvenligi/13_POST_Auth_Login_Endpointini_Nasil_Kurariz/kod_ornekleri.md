# Bölüm 13 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# POST /auth/login Endpoint'ini Nasıl Kurarız?

## Ada'nın Giriş Düğmesi Artık Bir Yere Ulaşmalı

Kayıt formunu tamamladığımızda Ada'nın hesabını veritabanına yazabilmiştik. Şimdi giriş ekranına e-posta ve parolasını yazıyor. On birinci bölümde bu bilgileri nasıl doğrulayacağımızı, on ikinci bölümde hataları nasıl göstereceğimizi belirledik.

Şimdi `POST /auth/login` isteğini gerçek Movie API'ye bağlayacağız. Uygulamanın yapısını değiştirmiyoruz: Movie API'de zaten kullandığımız **Router → Controller → Service → Model** düzenini sürdürüyoruz.

```http
POST /auth/login
Content-Type: application/json
```

## Örnek 2



```json
{
  "email": "ADA@EXAMPLE.COM",
  "password": "uzun-bir-deneme-parolasi"
}
```

## Örnek 3

Bu adımda `POST /auth/login`, e-posta ve parolayı doğrulayıp başarılı ya da başarısız bir HTTP yanıtı verecek. **Yeni istekte aynı kullanıcıyı hatırlamak** ise ayrı bir ihtiyaç: HTTP her isteği kendi başına işlediğinden, bunu 14. bölümden itibaren oturum bilgisiyle çözeceğiz.

## Service: Kullanıcıyı Bul ve Parolasını Doğrula

Onuncu bölümde açtığımız `src/services/auth.js` dosyasına şimdi `loginUser` fonksiyonunu ekleyeceğiz. Aşağıda dosyanın **register ve login birlikte çalışan son hâli** bulunuyor:

```js
import { User } from "../db/models/user.js";
import {
  hashPassword,
  verifyPassword,
} from "../utils/password.js";

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("Bu e-posta adresiyle bir hesap zaten var.");
    error.status = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);
  return User.create({ name, email, passwordHash });
};

const invalidCredentials = () => {
  const error = new Error("E-posta veya parola hatalı.");
  error.status = 401;
  return error;
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email })
    .select("+passwordHash");

  if (!user) {
    throw invalidCredentials();
  }

  const isPasswordValid = await verifyPassword(
    user.passwordHash,
    password,
  );

  if (!isPasswordValid) {
    throw invalidCredentials();
  }

  return user;
};
```

## Örnek 4

`User.findOne()` e-posta adresiyle arama yapıyor. `.select("+passwordHash")` ise normalde getirilmeyen hash alanını **yalnızca bu sorguda** açıyor. `verifyPassword()` ham parolayı saklanan hash ile doğruluyor. İki başarısız durumda da `401` hazırlanıyor.

Bu fonksiyon Mongoose belgesini Controller'a döndürüyor; fakat **bu belge olduğu gibi HTTP yanıtına gönderilmeyecek**.

Mevcut merkezi hata yöneticisi, 10. bölümde eklediğimiz `error.status` kontrolü sayesinde `401` yanıtını taşıyabiliyor. O değişiklik yapılmadıysa doğru login kodu bile beklenmeyen bir `500` verebilir; önce onu tamamlayın.

## Kullanıcı Verisini Dışarıya Tek Bir Yerden Açalım

Register sırasında güvenli alanları Controller içinde tek tek yazmıştık. Login'de de aynı alanları göndereceğiz. Artık gerçek bir tekrar oluştuğu için küçük bir yardımcı fonksiyon işe yarıyor.

`src/utils/toPublicUser.js` dosyasını oluşturun:

```js
export const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});
```

## Örnek 5

Bu fonksiyon önemli bir sınır koyuyor: `passwordHash`, Service tarafından kullanılmış olsa bile yanıtın bir parçası değil.

## Controller: HTTP Yanıtını Hazırla

Şimdi `src/controllers/auth.js` dosyasındaki register fonksiyonunu da yeni helper ile kullanalım. Dosyanın tamamı şöyle olabilir:

```js
import * as authService from "../services/auth.js";
import { toPublicUser } from "../utils/toPublicUser.js";

export const registerUser = async (req, res) => {
  const user = await authService.registerUser(req.body);

  return res.status(201).json({
    message: "Kullanıcı oluşturuldu.",
    data: toPublicUser(user),
  });
};

export const loginUser = async (req, res) => {
  const user = await authService.loginUser(req.body);

  return res.status(200).json({
    message: "Giriş başarılı.",
    data: toPublicUser(user),
  });
};
```

## Örnek 6

`Controller` parolayı karşılaştırmıyor. Service'den gelen başarılı sonucu alıyor ve istemciye gösterilecek alanları belirliyor. Böylece HTTP yanıtını hazırlama ile kullanıcıyı doğrulama sorumlulukları birbirinden ayrı kalıyor.

## Router: `/auth/login` Yolunu Aç

`src/routers/auth.js` dosyamızın tamamı:

```js
import { Router } from "express";
import {
  registerUser,
  loginUser,
} from "../controllers/auth.js";
import { validateBody } from "../middlewares/validateBody.js";
import {
  registerUserSchema,
  loginUserSchema,
} from "../validation/auth.js";

const router = Router();

router.post(
  "/register",
  validateBody(registerUserSchema),
  registerUser,
);

router.post(
  "/login",
  validateBody(loginUserSchema),
  loginUser,
);

export default router;
```

## Örnek 7

Onuncu bölümde auth router'ı zaten `src/server.js` dosyasına bağlamıştık:

```js
app.use("/auth", authRouter);
```

## Örnek 8

Bu satırı yeniden eklemeyeceğiz. Mevcut `POST /auth/register` çalışmaya devam ederken `POST /auth/login` da kullanılabilir olacak.

## Ada'nın Girişi Çalışıyor mu?

Yerel test veritabanında Ada'nın kaydı oluşturulmuş olsun. Postman ile şu üç denemeyi yapın:

| Gönderilen bilgi | Beklenen HTTP sonucu |
|---|---|
| Doğru e-posta, doğru parola | `200 OK` |
| Doğru e-posta, yanlış parola | `401 Unauthorized` |
| Kayıtlı olmayan e-posta | `401 Unauthorized` |

Başarılı yanıtın biçimi:

```json
{
  "message": "Giriş başarılı.",
  "data": {
    "id": "...",
    "name": "Ada",
    "email": "ada@example.com",
    "createdAt": "..."
  }
}
```

## Örnek 9

E-posta kaydı bulunmadığında da parola yanlış olduğunda da:

```json
{
  "message": "E-posta veya parola hatalı."
}
```
