# Bölüm 20 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

ında kimliği sunucuda doğrulanır; fakat tarayıcının oturum çerezini nasıl saklayıp hangi istekte gönderdiği ayrı bir güvenlik meselesidir. `HttpOnly`, `Secure` ve `SameSite` aynı ayar değildir: birincisi JavaScript erişimini, ikincisi güvenli bağlantıda gönderimi, üçüncüsü siteler arası istek bağlamını sınırlar. Şimdi her ayarın hangi riske cevap verdiğine ayrı ayrı bakacağız.

## Ada'nın Oturumu Çalışıyor. Peki Cookie Nasıl Korunacak?

Ada giriş yaptığında sunucu bir oturum kaydı oluşturuyor. Tarayıcı da bu oturumu sonraki isteklerde tanıtacak cookie'yi taşıyor. MongoDB'de doğru kayıt bulunması önemli; fakat **oturum kimliği yanlış ellere geçerse** kayıt hâlâ geçerli olabilir.

Ada'nın oturum çerezini iki farklı açıdan düşünelim. Film sayfasındaki bir JavaScript kodu çerezin değerini okumaya çalışabilir. Başka bir siteden gelen bir istek de tarayıcının o çerezi göndermesini tetikleyebilir. Üstelik bağlantı güvenli değilse kimlik bilgisi yol üzerinde açığa çıkabilir.

Bu **üç farklı risk** için aynı ayar kullanılmıyor. Kodda zaten gördüğümüz `HttpOnly` ve `SameSite` ile başlayıp ardından `Secure` ayarını ekleyeceğiz.

## `HttpOnly`: Sayfanın JavaScript Kodu Cookie'yi Okuyabilir mi?

```js
cookie: {
  httpOnly: true,
}
```

## Örnek 2

Ada'nın film sayfasındaki JavaScript, `document.cookie` ile `sid` değerini okumaya çalıştığında `HttpOnly` nedeniyle **bu çerezi göremez**. Tarayıcı ise kurallarına uyan HTTP isteklerinde çerezi sunucuya **kendisi eklemeyi sürdürür**. Yani `HttpOnly`, çerezi tarayıcıdan saklamaz; sayfadaki JavaScript'in doğrudan erişimini engeller. Bu, kötü amaçlı bir betiğin oturum kimliğini kopyalamasını zorlaştıran bir önlemdir.

Ancak `HttpOnly` bütün zararlı script etkilerini ortadan kaldırmaz. Sayfada çalışan script, kullanıcının tarayıcısından hâlâ istek gönderebilir. Dolayısıyla bu ayar **XSS güvenliğinin tamamı değil, bir koruma katmanıdır**.

## `Secure`: Cookie Hangi Bağlantıda Gönderilir?

```js
cookie: {
  secure: true,
}
```

## Örnek 3

Ada evindeki ortak Wi-Fi ağı üzerinden hesabına girse de oturum kimliğinin şifresiz HTTP bağlantısında gönderilmesini istemeyiz. `Secure: true`, tarayıcının bu çerezi normalde **yalnızca HTTPS bağlantısında** göndermesini sağlar. Bu, çerez değerinin kendi başına şifreli olduğu anlamına gelmez; değerin **taşındığı bağlantıyı** sınırlar. Sunucumuzun da gerçekten HTTPS erişimi sunması gerekir.

Biz yerel geliştirmede çoğunlukla `http://localhost:3000` kullanıyoruz. Bu ortamda cookie'nin davranışı tarayıcıya ve güvenli bağlam istisnalarına göre değişebilir. Başlangıçta açıkça iki ortamı ayıracağız. Zaten kullandığımız `src/config/env.js` dosyasındaki **mevcut `env` nesnesine** şu alanı ekleyin:

```js
nodeEnv: process.env.NODE_ENV ?? "development",
```

## Örnek 4

z `lax`. Ancak bu ayar **CSRF saldırılarına karşı tek başına yeterli bir savunma değildir**. Kullanıcının haberi olmadan işlem yaptırılmasını önlemeye yönelik kontrolleri 65. bölümde ayrıca ele alacağız.

Ada'nın aynı çerezini üç açıdan inceleyelim. `HttpOnly`, sayfanın JavaScript kodunun çerez değerini doğrudan okumasını sınırlar. `Secure`, tarayıcının bu çerezi hangi bağlantıda göndereceğiyle ilgilidir; gerçek kullanıcıların bağlantısında HTTPS kullanmamız gerekir. `SameSite` ise isteği başka bir site başlattığında çerezin ne zaman gönderileceğini sınırlar. **Bir ayar okumayı, biri bağlantıyı, diğeri isteğin geldiği bağlamı ilgilendirir.**

Hiçbiri Ada'nın yönetici olup olmadığını veya Deniz'in kaydını değiştirmeye yetkili olup olmadığını söylemez. Bunları ayrıca sunucuda kontrol edeceğiz. Çerezi güvenli taşımakla, çerezi gönderen hesaba ne yapma izni verdiğimizi aynı konu sanmıyoruz.

## Cookie Ayarlarını Bir Araya Getirelim

Artık mevcut session middleware'ini, **yeniden eklemeden**, aşağıdaki ayarlarla güncelliyoruz:

Aşağıdaki birleşik ayarlar `src/server.js` içindeki mevcut session middleware bloğunun yerini alır. `isProduction` değişkeni de o blokla aynı dosyada tanımlanır.

```js
const isProduction = env.nodeEnv === "production";

app.use(
  session({
    name: isProduction ? "__Host-sid" : "sid",
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: env.mongodbUrl,
    }),
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 1000 * 60 * 60 * 8,
    },
  }),
);
```

## Örnek 5

t istisnaları olabilir) | Hayır |

Burada yeni görünen `__Host-sid` adını da açıklayalım. Tarayıcılar `__Host-` ile başlayan çerezler için **`Secure` bulunmasını, yolun `/` olmasını ve `Domain` belirtilmemesini** şart koşar. Böylece çerezin daha dar ve tutarlı kurallarla oluşturulmasına yardımcı oluruz. Bu yüzden HTTPS kullanılan canlı ortamda `__Host-sid`, yerel HTTP denemesinde ise `sid` seçiyoruz. `isProduction` tek başına bağlantıyı HTTPS yapmaz; canlı ortamın buna uygun yapılandırılması da gerekir.

## Reverse Proxy Arkasında Bir Ayrıntı

Ada, Movie API'yi canlı ortamda açıp giriş yapıyor. Tarayıcısındaki adres `https://` ile başlıyor; yani **Ada ile sitenin dış kapısı arasındaki bağlantı HTTPS**. Buna rağmen girişten sonra oturum çerezi beklediğimiz gibi oluşmayabilir. HTTPS kullandığımıza göre sorun nereden çıkıyor?

Bazı barındırma platformlarında Ada'nın isteği Node.js'e doğrudan ulaşmaz. Önce isteği karşılayan bir **reverse proxy** üzerinden geçer. Reverse proxy'yi, binanın girişindeki görevli gibi düşünün: ziyaretçiyi ilk o karşılar, ardından ilgili odaya yönlendirir. Web uygulamasında da proxy, dışarıdan gelen isteği alıp Movie API'nin çalıştığı Node.js sürecine iletir.

```text
Ada'nın tarayıcısı         Reverse proxy             Movie API (Node.js)
       |                        |                            |
       |---- HTTPS isteği ----->|                            |
       |                        |---- HTTP isteği ---------->|
       |                        |    (iç ağda olabilir)      |
       |                        |                            |
```

## Örnek 6

Buradaki önemli ayrım şu: **Ada'nın tarayıcısı HTTPS kullanırken Node.js'in proxy'den aldığı son bağlantı HTTP olabilir.** Node.js yalnızca bu son bağlantıya bakarsa isteğin başlangıçta HTTPS ile geldiğini anlayamayabilir. `cookie.secure: true` kullanan oturum yapılandırması da isteği güvenli görmediği için çerezi beklediğimiz gibi göndermeyebilir.

Peki Node.js, Ada'nın dışarıda HTTPS kullandığını nasıl öğrenecek? Güvenilir proxy, isteğin geldiği protokolü örneğin `X-Forwarded-Proto: https` başlığıyla bildirebilir. Express'in bu bilgiyi kabul etmesi için proxy'ye **hangi sınırlar içinde güveneceğini** bilmesi gerekir.

Altyapıda Node.js'in önünde gerçekten **tek bir güvenilir proxy geçişi** varsa ve isteklerin izleyeceği yol denetleniyorsa aşağıdaki ayar uygun olabilir. Bunu `session` middleware'inden **önce** yaparız; çünkü oturum middleware'i çerezle ilgili kararını isteği işlerken verir:

Ters proxy arkasındaki dağıtım için gösterilen `app.set(...)` satırı, Express uygulamasının oluşturulduğu `src/server.js` dosyasına aittir; proxy kullanmayan ortamda doğrudan kopyalanacak evrensel bir ayar değildir.

```js
app.set("trust proxy", 1);
```
