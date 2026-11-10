# Bölüm 61 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

aşına sınayabiliyoruz. Ancak Ada'nın gönderdiği `POST /auth/login` isteği yalnızca bu fonksiyonlardan oluşmuyor; Router, middleware ve Controller üzerinden ilerliyor. **Supertest ile Express'e test kodumuzdan HTTP isteği göndererek** bu zincirin yanıtını denetleyeceğiz. Bunun için canlı ortam sunucusunu başlatmamız gerekmiyor.

## Test İçin Gerçek Port Açmak Zorunda Değiliz

Parola yardımcı fonksiyonunun testini yazdık. Ancak Ada'nın **Kayıt ol** düğmesine bastığında yalnız parola fonksiyonu çalışmıyor: İstek Router'dan geçiyor, doğrulanıyor, Service'e ulaşıyor ve HTTP yanıtı dönüyor. Bunlardan biri yanlış bağlanırsa tek başına başarılı parola testi bunu göstermez.

Şimdi Movie API'nin gerçek Express yollarına test isteği göndereceğiz. Örneğin `POST /auth/register` isteğinin gerçekten `201` yanıtı döndüğünü kontrol edeceğiz. Bunun için tarayıcı açmamıza veya uygulamayı ayrıca bir portta dinletmemize gerek yok: `supertest` paketini ekleyelim. `node:test` testi **çalıştırır**; `supertest` ise Express uygulamasına HTTP isteği gönderip durum kodunu ve yanıtı incelemeyi kolaylaştırır. İkisini birlikte kullanmamızın nedeni aynı iş için iki araç eklemek değil, iki farklı görevi çözmektir.

```bash
npm install --save-dev supertest
```

## Örnek 2

---

Ada'nın tarayıcı yerine test kodundan `POST /auth/login` isteği gönderdiğimizi düşünelim. Supertest gerçek bir ağda ayrı bir sunucu başlatmamıza gerek olmadan Express uygulamasının HTTP davranışını sınayabilir; **ancak testte kullandığımız Express örneğinin üretimdeki middleware sırasıyla aynı olması gerekir**. Test için `app` ile `listen()` çağrısını ayırmamızın önemli nedeni budur: HTTP akışını sınarken port ve dış sistem bağımlılıklarını kontrol altında tutabiliriz.

## `app` ve `listen()` Ayrımı Zaten Hazır

Bu aşamada yeni bir `src/app.js` dosyası oluşturmamıza gerek yok. Movie API, Express uygulamasını zaten `src/server.js` içinde oluşturuyor:

```js
export const app = express();
```

## Örnek 3

Veritabanına bağlanma ve sunucuyu dinlemeye başlatma işlemi ise ayrı dosyada, `src/index.js` içinde yapılıyor. Orada `app`, mevcut dosyadan alınıyor:

```js
import { app } from "./server.js";
```

## Örnek 4

Bir başka deyişle `src/server.js` içindeki uygulamayı **test sırasında import edebiliriz**; gerçek bir portta dinlemeye başlamamız gerekmez. `src/db/initMongoConnection.js` dosyamız da zaten var; aynı görevi yapan yeni bir `connectMongo.js` oluşturmayacağız.

Gerçek kullanıcı kaydı gibi MongoDB gerektiren işlemleri test ederken **ayrı test veritabanı bağlantısı** gerekir. Bunun güvenli kurulumunu 64. bölümde ele alıyoruz. Şimdilik önce veritabanına ihtiyaç duymayan `/health` yolunu test edelim.

---

## İlk Endpoint Testi

Ada için kayıt isteği gönderen test, tarayıcı açmadan sunucunun isteğe verdiği **HTTP yanıtını** kontrol eder. Ancak bu tür bir testin çalışması, tek başına e-posta gönderimi veya MongoDB bağlantısının bütün senaryolarda doğru olduğunun kanıtı değildir; kullandığımız test ortamı ve hazırlanmış veriler sonucu etkiler.

Bu ilk HTTP testi için yeni `test/health.test.js` dosyasını oluşturun. Test, mevcut `src/server.js` içindeki `app` nesnesini import eder; `src/index.js` üzerinden port açmaz.

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

import { app } from "../src/server.js";

describe("health endpoint", () => {
  it("200 döner", async () => {
    const response = await request(app)
      .get("/health");

    assert.equal(response.status, 200);
  });
});
```

## Örnek 5

Supertest Response üzerinde:

```text
status
body
headers
```

## Örnek 6

gibi bilgileri inceleyebiliriz. **`status` sunucunun verdiği HTTP durum kodunu, `body` ise dönen JSON içeriğini gösterir.**

---

## Register Testi

Bu kayıt testi, test veritabanı bağlantısı hazırlandıktan sonra örneğin `test/auth-http.test.js` dosyasına konulabilir. Buradaki parçanın tek başına çalışması için gerekli `import`lar, test grubu ve başlangıç verileri de tanımlanmalıdır.

```js
const response = await request(app)
  .post("/auth/register")
  .send({
    name: "Ada",
    email: "ada@example.com",
    password: "uzun-bir-test-parolasi",
  });

assert.equal(response.status, 201);
assert.equal(
  response.body.data.email,
  "ada@example.com",
);
```

## Örnek 7

Ayrıca hassas alanın çıkmadığını kontrol edelim:

```js
assert.equal(
  response.body.data.passwordHash,
  undefined,
);
```

## Örnek 8

Bu güvenlik davranışı artık otomatik test sözleşmesidir.

---

## Cookie Kontrolü

Giriş isteğine verilen HTTP yanıtında:

```js
const cookies = response.headers["set-cookie"];

assert.ok(cookies);
```

## Örnek 9

ve cookie string'lerinde:

```text
HttpOnly
```

## Örnek 10

olduğunu test edebiliriz.

Production-only `Secure` davranışını test ortamı config'ine göre ayrı test etmek gerekir.

---

Ada `/auth/login` isteğini gönderince sunucu `Set-Cookie` başlığıyla giriş bilgisini tarayıcıya iletebilir. Tarayıcı sonraki istekte uygun çerezi otomatik ekler. Tek tek `request(app)` çağrıları kullandığımız testte bu tarayıcı davranışını kendimiz taşımadıkça yeni istek **önceki girişten habersizdir**.

`request.agent(app)` aynı testteki istekler için çerezleri saklayan bir istemci gibi davranır. Bu sayede **giriş → `/users/me` isteği** zincirini tek kişinin tarayıcısından çıkmış gibi sınayabiliriz. `agent` kullanmak uygulamanın güvenlik kontrolünü gevşetmez; yalnız testte çerezlerin gerçekçi biçimde taşınmasını sağlar.

## `request.agent()` Cookie'leri Saklar

Çok adımlı auth testlerinde:

```js
const agent = request.agent(app);
```

## Örnek 11

kullanışlıdır.

Buradaki **agent**, test süresince aynı tarayıcıyı taklit eden yardımcıdır. Ada bir kez giriş yaptığında dönen çerezleri hatırlar ve sonraki istekte tekrar gönderir. Böylece her istek için oturum çerezini elle kopyalamayız.

```js
await agent
  .post("/auth/login")
  .send(credentials);

const meResponse = await agent
  .get("/users/me");
```

## Örnek 12

Bu, gerçek browser oturumuna daha yakın integration test yazmamızı sağlar.

---

Sonuçları yorumlarken şu ayrımı yapalım: Giriş isteği `200` dönüp ikinci istek `401` oluyorsa “parola doğrulaması bozuk” demek için erken. Önce çerezin gönderilip gönderilmediğine, `authenticate` middleware'inin çalışmasına ve kullanıcı kaydının bulunmasına bakarız. **Aynı kullanıcı yolculuğunun farklı adımlarını ayrı ayrı görmemiz**, hatayı doğru yerde aramamızı sağlar.

## Test Hatası Bize Hangi Katmanı Gösterir?

HTTP yolu testi başarısız olduğunda sorun:

```text
validation
router
controller
service
database
cookie
auth middleware
```
