# Bölüm 19 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

ştireceğimiz şey, başarılı girişin ardından oluşan oturum kaydının saklandığı yer.** Kaydı MongoDB'ye taşıdığımızda, Node.js yeniden başlasa bile kayıt veritabanında durabilecek.

Bunu yapabilmek için önce üç farklı bilginin yerini netleştirelim:

| Nerede? | Ne bulunuyor? | Ne işe yarıyor? |
|---|---|---|
| Ada'nın tarayıcısında | `sid` adlı çerez | Sunucuya hangi oturumun aranacağını söyler. |
| MongoDB'deki `sessions` kayıtlarında | Oturum kimliğiyle ilişkilendirilmiş `userId` ve oturuma ait bilgiler | Sunucunun bu oturumla hangi hesabı ilişkilendirdiğini bulmasını sağlar. |
| MongoDB'deki `users` koleksiyonunda | Ada'nın kullanıcı hesabı | E-posta adresi ve diğer kalıcı hesap bilgilerini içerir. |

Bu tabloyu tek cümlede okuyabiliriz: **Tarayıcı oturumu tanıtan kimliği taşır; MongoDB'deki `sessions` kaydı bu kimliğin hangi kullanıcıyla ilişkili olduğunu saklar; `users` koleksiyonu ise kullanıcının asıl hesabını tutar.**

Ada'nın bütün hesap bilgilerini çereze koymuyoruz. Aynı şekilde, her yeni oturum için yeni bir kullanıcı hesabı da oluşturmuyoruz. **Bir hesabın birden fazla oturumu olabilir.**

Aşağıdaki çizim, daha kod yazmadan önce kurmak istediğimiz yeni düzeni gösteriyor:

```text
ADA'NIN TARAYICISI            MOVIE API (Node.js)                MONGODB

sid çerezi                    express-session
    |                               |                             
    |---- Cookie: sid=... --------->|                             
    |                               |---- Oturumu bul ------------> sessions
    |                               |<--- userId içeren kayıt -----|
    |                               |
    |                               '---- req.session.userId hazır
    |
    '--- Tarayıcıdaki sid, kullanıcı profilinin tamamı değildir.

MongoDB'deki users koleksiyonu: Ada'nın kalıcı hesabı
MongoDB'deki sessions koleksiyonu: Ada'nın mevcut oturum kaydı
```

## Örnek 2

arsayılan `MemoryStore` kullanılıyordu; yani kayıtlar Node.js'in RAM belleğinde tutuluyordu.

Şimdi `connect-mongo` paketini ekleyeceğiz. Paket, `express-session` için **MongoDB'de oturum kaydı tutabilen bir saklama mekanizması** sağlar. Bunun adı `MongoStore`.

Aralarındaki görev paylaşımı şöyle: `express-session` gelen çerezi ve `req.session` nesnesini yönetir; `MongoStore` ise ilgili oturum kaydını **MongoDB'ye yazma ve gerektiğinde geri okuma** işini üstlenir. Biri diğerinin yerine geçmez; birlikte çalışırlar.

Bunu bir görev değişikliği olarak düşünelim: İlk kurulumumuzda `express-session` bir oturum kaydını **Node.js belleğindeki çekmeceye** koyuyordu. Artık aynı kaydı **MongoDB'ye** bırakacak. Çerezi oluşturan ve oturumu isteğe bağlayan mekanizma aynı kalıyor; kayıtların bulunduğu yer değişiyor.

Bu seçimi neden yaptık? Movie API zaten film ve kullanıcı kayıtları için MongoDB kullanıyor. Böylece yalnız oturum kayıtlarını saklamak için yeni bir veritabanı teknolojisi öğrenmemiz gerekmiyor. Redis gibi başka uygun çözümler de var; **MongoDB burada projemizin mevcut altyapısına uyduğu için tercihimiz.**

Paketi `package.json` dosyasının bulunduğu Movie API klasöründe yükleyelim:

```bash
npm install connect-mongo
```

## Örnek 3

## `src/server.js` İçinde Yalnızca Saklama Yöntemini Değiştirelim

Mevcut `session` middleware'i zaten çalışıyor. `src/server.js` dosyasındaki import'lara şunu ekleyin:

```js
import MongoStore from "connect-mongo";
```

## Örnek 4

Ardından **mevcut `app.use(session(...))` bloğunu** aşağıdaki sürümle değiştirin. Eski bloğun altına ikinci bir session middleware'i eklemiyoruz:

Bu değişikliği `src/server.js` dosyasındaki **mevcut** `app.use(session(...))` bloğunda yapın; ikinci bir session middleware eklemeyin.

```js
app.use(
  session({
    name: "sid",
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: env.mongodbUrl,
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 8,
    },
  }),
);
```

## Örnek 5

vcut `src/config/env.js` dosyamız `MONGODB_URL` değerini **`env.mongodbUrl`** adıyla sunuyor. Yeni bir `MONGODB_URI` değişkeni tanımlamıyoruz. Bağlantı bilgisi parola içerebileceği için onu doğrudan kodun içine yazmıyoruz.
- **`cookie.maxAge: 1000 * 60 * 60 * 8`:** Tarayıcıdaki çerezin ömrünü belirler. Çarpımı birlikte hesaplayalım: `1000` milisaniye bir saniye; `60` saniye bir dakika; `60` dakika bir saat; `8` ise sekiz saat. Yani burada **sekiz saatlik bir çerez ömrü** belirledik. Bu süre örnek uygulamamızın tercihidir, bütün projeler için zorunlu bir değer değildir.

Dikkat edelim: `mongoUrl`, Ada'nın `userId` değeri değildir. `store` da `users` koleksiyonu değildir. **MongoDB bağlantı adresi nereye bağlanacağımızı, `store` hangi saklama yöntemini kullanacağımızı, `userId` ise bulunan oturumun kiminle ilişkili olduğunu belirtir.**

## Ada Giriş Yaptığında Artık Neler Oluyor?

Kodun etkisini, Ada'nın tarayıcısından gönderdiği iki isteği izleyerek görelim.

**İlk istek — Ada giriş yapıyor.** Saat 10.00 olsun. Ada, `POST /auth/login` ile e-posta adresini ve parolasını gönderiyor. Önceden yazdığımız giriş kodu bunları doğruluyor. Bilgiler doğruysa Controller'daki şu satır çalışıyor:

```js
req.session.userId = user._id.toString();
```
