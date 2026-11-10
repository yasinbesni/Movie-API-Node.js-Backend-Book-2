# Bölüm 17 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

z. Giriş işlemini yeniden yazmayacağız: Mevcut `authService.loginUser()` parolayı zaten doğruluyor. Değişecek olan, **başarılı girişten sonra sunucunun neyi hatırladığı**.

Şu ana kadar parolayı doğruladığımızda yalnızca **o isteğin** başarılı olduğunu biliyorduk. Ada girişten sonra kendisine ait bir listeyi açmak istediğinde yeni bir HTTP isteği gönderir; sunucu önceki giriş yanıtını kendiliğinden hatırlamaz. Kişisel listeyi henüz geliştirmedik, ama **isteğin kimin adına geldiğini** anlamayı şimdi kuruyoruz.

Bu eksikliği üç parçayla çözeceğiz:

1. **Tarayıcı:** `sid` adlı çerezde yalnızca bir oturum kimliği taşır.
2. **Sunucudaki oturum kaydı:** `sid` değerinin hangi kullanıcıya ait olduğunu gösteren `userId` bilgisini tutar. Bu kayıt şimdilik Node.js belleğinde saklanır.
3. **`users` koleksiyonu:** Ada'nın gerçek hesap bilgilerini tutmaya devam eder. Çerez, bu hesap bilgilerinin kopyası değildir.

`express-session` aradaki bağlantıyı kurar: Oturum kimliğini oluşturur, çerezle gönderir ve sonraki istekte `req.session` üzerinden ilgili oturum verisine ulaşmamızı sağlar. Bu nedenle login kodunu değiştirmek yerine **başarılı girişten sonra küçük bir kayıt** eklememiz yeterli olacak.

```bash
npm install express-session
```

## Örnek 2

Kurulumu, Movie API çalışma klasöründe `package.json` dosyasının bulunduğu yerde yapın. Başlangıç dosyalarına ulaşamıyorsanız *Bu Kitabı Nasıl Kullanmalı?* bölümündeki kaynak bağlantısını kullanın.

## Middleware'i Gerçek Proje Dosyasına Ekleyelim

Bizim Movie API'mizde Express uygulaması **`src/server.js`** dosyasında kuruluyor; genel bir `app.js` dosyası aramanıza gerek yok. Önce `src/config/env.js` içindeki mevcut `env` nesnesine şu alanı ekleyin:

```js
sessionSecret: getRequiredString("SESSION_SECRET"),
```

## Örnek 3

`getRequiredString()` yardımcı fonksiyonu `src/config/env.js` içinde zaten bulunuyor. Yeni bir `env` nesnesi oluşturmayın; mevcut nesneyi genişletin. `.env` dosyanızda da `SESSION_SECRET` bulunmalı. Güçlü, rastgele bir değer üretmek için terminalde **Node.js** ile şunu çalıştırabilirsiniz:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

## Örnek 4

Çıktıyı `.env` içindeki `SESSION_SECRET=` satırına yazın. Bu değeri GitHub'a göndermeyin. `.env.example` dosyasına yalnızca gerçek gizli değer içermeyen bir açıklama ekleyin.

Şimdi `src/server.js` dosyasına `session` import'unu ekleyin:

```js
import session from "express-session";
```

## Örnek 5

Mevcut `app.use(express.json())` satırından sonra, **`app.use("/auth", authRouter)` satırından önce** şu middleware'i ekleyin:

Bu middleware bloğunun yeri mevcut `src/server.js` dosyasıdır. Yeni bir sunucu dosyası açmadan, `express.json()` sonrasındaki middleware sırasına ekleyin.

```js
app.use(
  session({
    name: "sid",
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
    },
  }),
);
```

## Örnek 6

asını yeniden başlattığımızda bellekteki kayıt kaybolur. Sonraki istekte aynı `sid` gelir, fakat sunucu Ada'nın oturumunu bulamaz. 18. bölümde önce bu davranışı gözlemleyip neden gerçek bir uygulamada yeterli olmadığını anlayacağız.

Ada'nın girişini baştan sona izleyelim. İlk `POST /auth/login` isteğinde tarayıcının henüz bir `sid` çerezi olmayabilir. Oturum ara katmanı isteğe bir `req.session` hazırlar; parola doğruysa Controller buraya Ada'nın `userId` değerini yazar. Yanıtla gönderilen `sid`, bir sonraki istekte **hangi oturum kaydının bulunacağını** söyler. `sid` kendi başına Ada'nın adı, parolası veya MongoDB'deki kullanıcı belgesi değildir. Sunucu çerezdeki oturum kimliğinin karşılığını bulur; kayıttaki `userId` üzerinden hesabı tanıyabilir.

Üç nesnenin görevini karıştırmadığımızda kod da anlaşılır kalır: Çerez **kaydı bulur**, oturum kaydı **hesap kimliğini gösterir**, `User` kaydı ise **hesap bilgilerini içerir**. İstek bu üç aşamadan geçerek Ada'ya bağlanır.

## Login İşlemine Bir Adım Ekleyelim

`src/controllers/auth.js` içindeki login Controller'ımız başarılı kullanıcıyı zaten Service'den alıyor. **Sadece başarılı sonuçtan sonra** `userId` değerini session'a yazacağız:

```js
export const loginUser = async (req, res) => {
  const user = await authService.loginUser(req.body);

  req.session.userId = user._id.toString();

  return res.status(200).json({
    message: "Giriş başarılı.",
    data: toPublicUser(user),
  });
};
```

## Örnek 7

Bu, mevcut Controller'ın güncellenen sürümüdür; register Controller'ını veya Router'ı yeniden eklemiyoruz. Parola yanlışsa Service `401` üretir ve `req.session.userId` satırına gelinmez.

**Buradaki tek yeni satır neden önemli?** `req.session.userId`, Ada'nın MongoDB'deki kullanıcı kimliğini oturum kaydına iliştirir. Tarayıcıya kullanıcının parolası veya bütün `User` belgesi gitmez. Sonraki istekte çerezdeki `sid` bulunursa, sunucu bu kimliğin bağlı olduğu oturumu okuyabilir. Henüz her route'u koruyan bir yetkilendirme sistemi kurmuş değiliz; yalnızca **kullanıcıyı hatırlamayı** sağladık.

Burada güvenlik açısından henüz tamamlanmamış bir adım var: Başarılı login sırasında oturum kimliğinin yenilenmesi. **Oturum kimliği yenilenmediği sürece bu akış canlı ortamda kullanılmamalıdır.** 22. bölümde `req.session.regenerate()` ile bu açığı kapatacağız. Kullanıcı adı ve parolayı doğrulama ile güvenli bir oturum başlatmanın neden ayrı kararlar olduğunu orada göreceğiz.

## Ada'nın Sonraki İsteği

Postman'de yerel test veritabanındaki Ada hesabıyla `POST /auth/login` isteği gönderin. Yanıtta aşağıdakine benzeyen bir başlık görmelisiniz:

```http
Set-Cookie: sid=...; Path=/; HttpOnly; SameSite=Lax
```

## Örnek 8

Buradaki `...` yalnızca örneği kısaltmak için kullanıldı. Gerçek yanıtta `sid` çerezinin değeri, rastgele oluşturulmuş bir oturum kimliği ile bu kimliğe ait imzayı içerir. Postman'in cookie saklama özelliği etkinse, aynı sunucuya sonraki istekte bu cookie'yi taşıyabilir.

Henüz gerçek profil endpoint'imiz yok. Sadece yerelde, `src/server.js` içinde **session middleware'inden sonra** şu geçici yolu oluşturabilirsiniz:

```js
app.get("/debug/session", (req, res) => {
  res.json({
    userId: req.session.userId ?? null,
  });
});
```
