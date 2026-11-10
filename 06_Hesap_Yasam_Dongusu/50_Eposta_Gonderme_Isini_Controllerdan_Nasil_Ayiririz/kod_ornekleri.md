# Bölüm 50 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

lebini destek ekibine iletmek için aynı hizmeti kullanacağız. **Bu bölümde yardım talebi yalnızca metin taşıyacak; isteğe bağlı dosya ekini, Multer’ı öğrendikten sonra 58. bölümde ekleyeceğiz.** Böylece her yeni özellik için SMTP bağlantısını Controller’a kopyalamak yerine gönderimi tek yerde yöneteceğiz.

## Ada'nın Bağlantısı Henüz Posta Kutusuna Ulaşmadı

Ada’nın doğrulama ve sıfırlama bağlantıları hazır; sıradaki sorun bu bağlantıların e-posta hizmetine güvenle iletilmesi. Bu nedenle belirteç üretme sorumluluğuyla e-posta gönderme sorumluluğunu birbirinden ayıracağız.

Doğrulama belirtecini üretmek ile e-postayı göndermek iki farklı iştir: İlki Movie API'nin kendi güvenlik kararını üretir; ikincisi bu bağlantıyı Ada'nın posta kutusuna ulaştırmak için dış bir e-posta hizmetine başvurur. Bu ayrım sayesinde gönderim hizmeti hata verdiğinde belirteç güvenliğini bozmadan işlemi yönetebiliriz.

`Controller`, gelen HTTP isteğini alıp yanıtı oluşturur. E-posta sunucusuyla bağlantı kurmak onun işi olmamalı. E-posta gönderimini **Service (iş mantığı katmanı)** içinde tutarsak gönderim sağlayıcısını veya hata yönetimini değiştirdiğimizde Controller'ı da yeniden yazma ihtiyacını azaltırız.

```text
Router → Controller → Auth Service → E-posta Service → SMTP sağlayıcısı
                              ↘ MongoDB
```

## Örnek 2

SMTP (*Simple Mail Transfer Protocol* — Basit Posta Aktarım Protokolü), e-posta iletimi için kullanılan protokoldür. Gerçek gönderimi bir servis dosyasına taşıyacağız; testlerde aynı sınırı sahte bir göndericiyle değiştirebileceğiz.

Ada “E-posta gönderildi” mesajını görmüş olsun; fakat SMTP sunucusu isteği kabul etse bile mesaj gecikebilir veya teslim edilemeyebilir. **HTTP isteğinin başarıyla tamamlanması, e-postanın Ada'nın gelen kutusuna ulaştığını kesin olarak kanıtlamaz.** Bu yüzden servis, gönderim başarısızlığını kontrollü ele almalı; yeniden deneme ve süre aşımı davranışını düşünmelidir. Günlüklere parola sıfırlama bağlantısındaki ham token'ı yazmak ise destek ekibine yardımcı olmak yerine yeni bir hesap ele geçirme yolu oluşturur.

## Paketi ve Ortam Ayarlarını Ekleyelim

Terminali Movie API'nin `package.json` dosyasının bulunduğu klasörde açın:

```bash
npm install nodemailer
```

## Örnek 3

`.env` içine gerçek sağlayıcınızın bilgilerini ekleyin (aşağıdakiler örnektir):

```dotenv
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=ornek-kullanici
SMTP_PASS=ornek-sifre
EMAIL_FROM=no-reply@example.com
APP_BASE_URL=http://localhost:5173
```

## Örnek 4

Bu değerleri GitHub'a göndermeyin. Önceki bölümlerde kullandığımız `src/config/env.js` dosyasındaki `env` nesnesine şu alanları ekleyin:

```js
smtpHost: getRequiredString("SMTP_HOST"),
smtpPort: parsePositiveInteger("SMTP_PORT", process.env.SMTP_PORT, 587),
smtpUser: getRequiredString("SMTP_USER"),
smtpPass: getRequiredString("SMTP_PASS"),
emailFrom: getRequiredString("EMAIL_FROM"),
appBaseUrl: getRequiredString("APP_BASE_URL"),
```

## Örnek 5

`getRequiredString` ve `parsePositiveInteger`, mevcut `src/config/env.js` dosyasındaki yardımcı fonksiyonlardır. İlki zorunlu metin ayarlarının boş bırakılmasını, ikincisi ise sayısal ayarlara geçersiz veya pozitif olmayan değerler verilmesini engeller. SMTP portu için bir sınır daha var: `65535` değerini aşmamalı. Ayrıca `APP_BASE_URL` geçerli bir `http:` veya `https:` adresi olmalı. Bu iki kontrolü `env` nesnesinin hemen altına ekleyin:

```js
if (env.smtpPort > 65535) {
  throw new Error("SMTP_PORT geçersiz.");
}
const appUrl = new URL(env.appBaseUrl);
if (!["http:", "https:"].includes(appUrl.protocol)) {
  throw new Error("APP_BASE_URL HTTP(S) adresi olmalı.");
}
```

## Örnek 6

Üretimde HTTPS kullanın. Buradaki `.env` değerleri yalnız örnektir; gerçek SMTP hesabı olmadan e-posta gönderimi çalışmaz.

## E-posta Servisini Kuruyoruz

Yeni dosya `src/services/email.js`:

```js
import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpPort === 465,
  auth: { user: env.smtpUser, pass: env.smtpPass },
});

export const sendEmail = ({ to, subject, text, html, replyTo }) =>
  transporter.sendMail({
    from: env.emailFrom,
    to,
    subject,
    text,
    html,
    ...(replyTo ? { replyTo } : {}),
  });
```

## Örnek 7

Port `465` için doğrudan TLS, `587` için çoğunlukla STARTTLS kullanılır; sağlayıcının yönergelerini esas alın. `sendEmail()` dışında hiçbir Controller SMTP parolasını bilmeyecek.

## İki Bağlantıyı Tek Yerden Oluşturalım

Yeni `src/utils/accountEmails.js` dosyası:

```js
import { env } from "../config/env.js";

const makeLink = (path, token) => {
  const url = new URL(path, env.appBaseUrl);
  url.searchParams.set("token", token);
  return url.toString();
};

export const verificationLink = (token) =>
  makeLink("/verify-email", token);

export const passwordResetLink = (token) =>
  makeLink("/reset-password", token);
```

## Örnek 8

Bunlar **ön yüzde açılacak sayfaların örnek adresleridir**. Movie API içinde `/verify-email` adlı bir `GET` endpoint'i açmış olmuyoruz; API doğrulamayı `POST /auth/verify-email` ile yapıyor. Henüz bir ön yüz hazırlamadıysanız `http://localhost:5173` adresinde çalışan bir sayfa da bulunmayacaktır. Bu normaldir: Testte gelen bağlantının `token` parametresini Postman'e aktararak API'yi deneyeceğiz. Gerçek bir arayüz eklendiğinde adresleri o arayüzdeki sayfalarla eşleştirin.

HTML için bağlantıları doğru biçimde kaçıran bir template hazırlamak gerekir; ilk kurulumda güvenli ve basit **düz metin e-posta** ile başlayalım:

```js
export const sendVerificationEmail = (to, rawToken) =>
  sendEmail({
    to,
    subject: "E-posta adresini doğrula",
    text: `Adresini doğrulamak için: ${verificationLink(rawToken)}`,
  });

export const sendPasswordResetEmail = (to, rawToken) =>
  sendEmail({
    to,
    subject: "Parolanı yenile",
    text: `Yeni parola belirlemek için: ${passwordResetLink(rawToken)}`,
  });
```

## Örnek 9

Bu fonksiyonları `src/services/accountEmails.js` adlı yeni dosyaya yazın. Dosyanın başında `sendEmail` fonksiyonunu `./email.js` dosyasından; `verificationLink` ve `passwordResetLink` fonksiyonlarını `../utils/accountEmails.js` dosyasından import edin.

## Forgot Password Akışını Tamamlayalım

`src/services/auth.js` dosyasında mevcut işlemleri silmeden şu fonksiyonu ekleyin:

```js
export const requestPasswordReset = async (email) => {
  const user = await User.findOne({
    email,
    isEmailVerified: true,
  });
  if (!user) return;

  const rawToken = await issuePasswordResetToken(user._id);
  try {
    await sendPasswordResetEmail(user.email, rawToken);
  } catch {
    await AccountToken.updateOne(
      { tokenHash: hashToken(rawToken), usedAt: null },
      { $set: { usedAt: new Date() } },
    );
    // Hesap varlığını SMTP hatasıyla da açığa çıkarmıyoruz.
  }
};
```

## Örnek 10

Fonksiyonun import'larına `issuePasswordResetToken` (`./accountTokens.js`), `sendPasswordResetEmail` (`./accountEmails.js`), `AccountToken` ve `hashToken` (49. bölümde zaten eklenmiş olabilir) dahildir. Mail gönderimi başarısızsa belirteç kaydını geçersiz kılıyoruz; bu hata nedeniyle var olan hesaplara `500`, olmayan hesaplara `202` vererek **hesap varlığını açığa çıkarmıyoruz**. Gerçek sistemde başarısız gönderimler hassas bilgileri kaydetmeyen bir iç izleme/uyarı sistemine bildirilmelidir. Veritabanındaki iptal işlemi de hata verirse bu ayrı bir operasyonel hatadır. Ayrıca SMTP sağlayıcısının mesajı kabul etmesi, e-postanın alıcıya **kesin teslim edildiğini** kanıtlamaz; kuyruk ve yeniden deneme altyapısı ayrı konudur.

`src/controllers/auth.js` dosyasına ekleyin:

```js
export const forgotPasswordController = async (req, res) => {
  await requestPasswordReset(req.body.email);
  res.status(202).json({
    message: "Adres uygunsa parola yenileme bağlantısı gönderilecektir.",
  });
};
```

## Örnek 11

Burada `requestPasswordReset` import'unu aynı Auth Service dosyasından ekleyin. Beklenmedik veritabanı hataları merkezi handler'a gider; SMTP kaynaklı başarısızlıklar ise hesabın varlığını açıklamayan genel yanıtı değiştirmez. Yine de **eşit yanıt metni, eşit yanıt süresi demek değildir**. Hesap varlığına göre gözlenebilen süre farklarını azaltmak için üretimde işi arka plan kuyruğuna almak daha sağlam bir yaklaşımdır.

## E-posta Doğrulamayı da Gönderime Bağlayalım

`src/services/accountEmails.js` içindeki `sendVerificationEmail` fonksiyonunu kullanarak `src/services/auth.js` dosyasına şu işlevi ekleyin:

```js
export const requestEmailVerification = async (user) => {
  if (user.isEmailVerified) return;
  const rawToken = await issueEmailVerificationToken(user._id);
  try {
    await sendVerificationEmail(user.email, rawToken);
  } catch (error) {
    await AccountToken.updateOne(
      { tokenHash: hashToken(rawToken), usedAt: null },
      { $set: { usedAt: new Date() } },
    );
    throw error;
  }
};
```

## Örnek 12

`issueEmailVerificationToken` import'unu `./accountTokens.js` dosyasından, `sendVerificationEmail` import'unu `./accountEmails.js` dosyasından ekleyin. Bu yolun kötüye kullanılmasını engellemek için ayrı rate limit ve yeniden gönderim bekleme süresi gerekir.

`src/controllers/auth.js` dosyasına:

```js
export const sendVerificationController = async (req, res) => {
  await requestEmailVerification(req.user);
  res.status(202).json({ message: "Doğrulama isteği alındı." });
};
```

## Örnek 13

Son olarak `src/routers/auth.js` içinde, mevcut yolları koruyarak şu üç yolu bağlayın. `authenticate` ve `validateBody` ara katmanları uygulamada zaten bulunuyor:

```js
router.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  forgotPasswordController,
);
router.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  resetPasswordController,
);
router.post(
  "/send-verification-email",
  authenticate,
  sendVerificationController,
);
```

## Örnek 14

önce e-posta gönderiminin başarısız olduğu durumları, aynı anda gelen istekleri, veritabanındaki işlemlerin tutarlılığını ve eski oturumların iptalini ayrıca sınamamız gerekir.


## Ada Yardım İstediğinde E-postalar Nereye Gidecek?

Ada, Movie API'ye giriş yapabiliyor ama profil fotoğrafını değiştirdiğinde hata alıyor olsun. Sorunu bildirmek için “Yardım talebi gönder” alanına şu mesajı yazıyor: *“Profil fotoğrafımı güncellerken işlem tamamlanamadı uyarısı görüyorum.”* Ada'nın mesajını teknik ekibe ulaştırmak ve talebinin kabul edildiğini ona bildirmek istiyoruz. **Bu aşamada yalnızca metin gönderiyoruz.** Ada hata ekranının görüntüsünü veya bir PDF belgesini eklemek isterse, dosya yüklemeyi öğrendikten sonra **58. bölümün son kısmında** aynı `POST /support/requests` yolunu geliştireceğiz. Ayrı bir endpoint açmayacağız.

Burada **iki farklı e-posta** var. İlki Ada'nın yazdığı açıklamayı uygulamanın destek posta kutusuna taşır. İkincisi Ada'ya “Talebiniz alındı” bilgisini verir. İkinci e-posta, sorunun çözüldüğü veya destek ekibinin ne zaman dönüş yapacağı anlamına gelmez. İlk e-posta da SMTP sağlayıcısı tarafından kabul edilmiş olsa bile alıcıya kesin ulaştığı sonucunu çıkaramayız.

```text
Ada → POST /support/requests → Controller → Destek Service
                                              ↓
                                     Ortak sendEmail()
                                     ↙              ↘
                             Destek adresi      Ada'nın adresi
                             Sorun açıklaması   Alındı bildirimi
```

## Örnek 15

Bu işlem için yeni bir SMTP bağlantısı kurmayacağız. Yukarıda oluşturduğumuz `src/services/email.js` hizmeti zaten `sendEmail()` fonksiyonunu sağlıyor. Bu kez yalnız destek e-postasında **`replyTo` (yanıtın gönderileceği adres)** alanına ihtiyaç var. `src/services/email.js` örneğindeki `sendEmail()` işlevine bu isteğe bağlı alanı ekledik. `from` yine uygulamaya ait doğrulanmış gönderici adresi olarak kalır; Ada'nın e-posta adresini `from` alanında taklit etmeyiz.

### Destek adresini nerede belirleyeceğiz?

Proje kökündeki `.env` dosyasına destek ekibinin **gerçekten kullandığı** posta kutusunu girin. Aşağıdaki adres bir örnektir; gerçek alıcı adresi değildir:

```dotenv
SUPPORT_EMAIL_TO=destek@example.com
```

## Örnek 16

Mevcut `src/config/env.js` içindeki `env` nesnesine aşağıdaki alanı ekleyin:

```js
supportEmailTo: process.env.SUPPORT_EMAIL_TO?.trim() || null,
```

## Örnek 17

: doğrulama ve parola sıfırlama çalışmaya devam eder. Destek talebi geldiğinde ise eksik ayarı kontrol edip `503 Service Unavailable` (hizmet geçici olarak kullanılamıyor) yanıtıyla işlemi durduracağız. Destek özelliğini kullanıma açmadan önce geçerli bir alıcı adresi girmek zorunludur.

### İstek gövdesinde neden e-posta adresi istemiyoruz?

Bu örnekte yardım talebi **giriş yapmış ve e-posta adresini doğrulamış** kullanıcılar içindir. Ada'nın kimliğini `authenticate` ara katmanı belirler; `requireVerifiedEmail` de kayıtlı posta kutusuna erişim doğrulamasının tamamlandığını kontrol eder. Böylece başkasının adresini `req.body.userEmail` olarak yazarak o kişiye otomatik e-posta gönderilmesini kolaylaştırmayız.

Ada'nın hesabına giriş yapamadığı durumlar için ayrıca herkese açık bir iletişim kanalı gerekir; **bu endpoint, giriş yapılamayan hesapların kurtarma kanalı değildir.** Giriş gerektirmeyen bir yardım formu tasarlarsak spam, sahte adres, CAPTCHA ve e-posta sahipliği gibi ek korumaları ayrıca çözmemiz gerekir.

Yeni `src/validation/support.js` dosyasını oluşturun. Mesaj alanını zorunlu tutuyor, çok uzun ve boş istekleri reddediyor, diğer alanların gönderilmesine izin vermiyoruz:

```js
import Joi from "joi";

export const supportRequestSchema = Joi.object({
  message: Joi.string().trim().min(10).max(2000).required(),
}).unknown(false);
```

## Örnek 18

`message` için 10–2000 karakter aralığı bu örnekte seçtiğimiz basit ürün kuralıdır. İstemci `email`, `role` veya `to` gönderse bile bunlarla posta alıcısını değiştiremez. Böylece yardım talebinin kime gönderileceği sunucunun yapılandırmasında kalır.

### Destek Service'ini yazalım

Yeni `src/services/support.js` dosyası:

```js
import { env } from "../config/env.js";
import { sendEmail } from "./email.js";

export const submitSupportRequest = async ({ user, message }) => {
  if (!env.supportEmailTo) {
    const error = new Error("Destek e-posta hizmeti şu anda kullanılamıyor.");
    error.status = 503;
    throw error;
  }

  // Önce destek posta kutusuna ilet. Başarısızsa istek hata verir.
  await sendEmail({
    to: env.supportEmailTo,
    replyTo: user.email,
    subject: "Movie API | Yeni yardım talebi",
    text: [
      "Yeni yardım talebi",
      `Kullanıcı kimliği: ${user._id}`,
      `Kayıtlı e-posta: ${user.email}`,
      "",
      "Kullanıcının mesajı:",
      message,
    ].join("\n"),
  });

  // Destek ekibine bildirim gitti; Ada'ya alındı e-postası dene.
  try {
    await sendEmail({
      to: user.email,
      subject: "Movie API | Yardım talebiniz alındı",
      text: [
        "Merhaba,",
        "",
        "Yardım talebiniz alınmıştır. İnceleme gerektiğinde",
        "kayıtlı e-posta adresiniz üzerinden iletişime geçebiliriz.",
        "Bu otomatik bildirim, sorunun çözüldüğü anlamına gelmez.",
      ].join("\n"),
    });
  } catch (error) {
    // Alındı bildirimi başarısız diye ilk e-postayı yeniden yollamayız.
    console.error("Destek alındı e-postası gönderilemedi:", {
      code: error?.code ?? "unknown",
    });
  }
};
```

## Örnek 19

Bu kodun iki önemli tercihi var. İlki, mesajı **düz metin (`text`)** göndermek: Ada'nın yazdığı `<script>` benzeri işaretlerin HTML içinde çalıştırılması riskini bu örnekte baştan önlüyoruz. İleride HTML şablonu kullanırsak, kullanıcı girdilerini HTML için uygun biçimde kaçırmalıyız. İkincisi, iki gönderimin farklı sonuçlar doğurması: Destek adresine gönderim başarısız olursa Controller başarılı yanıt vermez. İlk e-posta kabul edilip Ada'ya alındı mesajı gönderilemezse, destek talebi bir daha gönderilmesin diye işlemi başarısız saymıyoruz. **Bunun garantili bir destek takip sistemi olmadığını** unutmayın; kalıcı sıra numarası, kuyruk ve yeniden deneme isteniyorsa ayrıca bir veritabanı kaydı ve işleme mekanizması gerekir.

### Controller, Router ve istek sınırı

`src/controllers/support.js` adlı yeni dosyada, HTTP yanıtından yalnız Controller sorumludur:

```js
import { submitSupportRequest } from "../services/support.js";

export const submitSupportRequestController = async (req, res) => {
  await submitSupportRequest({
    user: req.user,
    message: req.body.message,
  });

  res.status(200).json({
    message: "Yardım talebiniz e-posta hizmetine iletildi.",
  });
};
```

## Örnek 20

Express 5, `async` Controller'ın Promise'i reddedildiğinde hatayı merkezi hata yöneticisine otomatik aktarır. Yalnız `next(error)` çağırmak amacıyla `try/catch` eklemiyoruz. Buradaki `200` yanıtı, **SMTP hizmetinin ilk gönderimi kabul ettiğini** belirtir; e-postanın destek ekibince okunmasını veya çözüme kavuşmasını garanti etmez.

E-posta göndermek de sınırlı bir kaynaktır. Bir kullanıcı aynı isteği yüzlerce kez yollayıp destek posta kutusunu doldurmasın diye istek sayısını sınırlandıracağız. Terminalde, `package.json` dosyasının bulunduğu klasörde:

```bash
npm install express-rate-limit
```

## Örnek 21

Yeni `src/middlewares/supportRateLimit.js` dosyası:

```js
import { rateLimit } from "express-rate-limit";

export const supportRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  keyGenerator: (req) => req.user._id.toString(),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Çok sık yardım talebi gönderildi. Daha sonra deneyin." },
});
```

## Örnek 22

Bu örnekte aynı kullanıcı bir saat içinde en fazla **üç istek** gönderebilir. Anahtar olarak IP adresini değil, `authenticate` sonrasında güvenle elde edilen kullanıcı kimliğini kullanıyoruz; aynı ağdaki iki kullanıcı böylece tek sayaç paylaşmıyor. Bu bellek tabanlı sınır, birden fazla sunucu kopyası veya yeniden başlatma için kalıcı değildir. Canlı ortamda ortak bir sayaç deposu ve uygun kötüye kullanım önlemleri gerekebilir.

Yeni `src/routers/support.js` dosyasını oluşturun:

```js
import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { requireVerifiedEmail } from "../middlewares/requireVerifiedEmail.js";
import { validateBody } from "../middlewares/validateBody.js";
import { supportRateLimit } from "../middlewares/supportRateLimit.js";
import { supportRequestSchema } from "../validation/support.js";
import { submitSupportRequestController } from "../controllers/support.js";

const router = Router();

router.post(
  "/requests",
  authenticate,
  requireVerifiedEmail,
  supportRateLimit,
  validateBody(supportRequestSchema),
  submitSupportRequestController,
);

export default router;
```

## Örnek 23

Mevcut `src/server.js` dosyasına, diğer Router import'larının yanına `supportRouter`ı da ekleyin ve hata yöneticisinden **önce** kaydedin:

```js
import supportRouter from "./routers/support.js";

// app.use(errorHandler) çağrısından önce:
app.use("/support", supportRouter);
```

## Örnek 24

Router dosyasındaki `"/requests"`, sunucudaki `"/support"` önekiyle birleştiğinde gerçek HTTP yolu **`POST /support/requests`** olur. Yeni Controller veya Service'e SMTP parolasını vermiyoruz; bu gizli bilgi yalnız ortak e-posta hizmetinin yapılandırmasında bulunuyor.

Bu yol çerezle korunduğu için **CSRF (başka bir sitenin Ada adına istek göndermesi)** riskini de dikkate almalıyız. `SameSite` ve CORS tek başına tam CSRF koruması değildir. 65. bölümde açıklanan CSRF belirteci veya uygulamanızın doğrulanmış `Origin` politikası gibi savunmalardan uygun olanı gerçek Router akışına bağlamadan bu endpoint'i canlıya açmayın. Yukarıdaki Router örneği **CSRF entegrasyonunu henüz içermiyor**; bunu tamamlanmış gibi kabul etmiyoruz.

### Ada'nın talebini baştan sona deneyelim

Ayrı test hesabı ve gerçek kullanıcılara gitmeyen bir test SMTP posta kutusu kullanın. Ada giriş yapmış ve e-posta adresini doğrulamış olsun. Postman'de geçerli giriş çereziyle aşağıdaki isteği gönderin:

```http
POST /support/requests
Content-Type: application/json
Cookie: accessToken=<TEST_ACCESS_TOKEN>

{
  "message": "Profil fotoğrafımı değiştirirken hata alıyorum."
}
```
