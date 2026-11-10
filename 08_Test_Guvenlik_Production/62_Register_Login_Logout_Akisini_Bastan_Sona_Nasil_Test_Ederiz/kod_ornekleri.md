# Bölüm 62 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

mesi, token yenilemesi ve çıkış yapması birbirine bağlı bir akış olarak doğru çalışmalı. **Tek tek `200` yanıtları almak yeterli değil; çerezin, token'ın ve veritabanı kayıtlarının her adımda beklediğimiz durumda olduğunu** da doğrulayacağız.

## Tek Tek İsteklerin Başarılı Olması Bütün Akışın Çalıştığını Gösterir mi?

Ada önce kaydoluyor, ardından giriş yapıyor, korumalı profilini açıyor ve çıkış yapıyor. Her endpoint ayrı ayrı doğru yanıt verse bile giriş sırasında gönderilen çerez sonraki istekte kaybolursa **Ada profilini açamaz**. İşte zincir testi, tek bir başarılı istek yerine bu dört adımın birbirine doğru bağlanıp bağlanmadığını araştırır.

Ada'nın hesabını tek bir istekle oluşturup sonucu kontrol etmek başlangıç için iyiydi. Fakat şimdi daha önemli bir soruya cevap arıyoruz: **Ada kayıt olduktan sonra giriş yapabiliyor, kimliğini sonraki isteğe taşıyabiliyor ve çıkış yaptığında o erişim gerçekten sona eriyor mu?**

Tek bir HTTP isteğinin sonucunu doğrulamakla başladık. Şimdi aynı test kullanıcısının kayıt, giriş, korumalı istek ve çıkış adımlarını **sırayla** izleyeceğiz. Böylece tek tek başarılı görünen endpoint'lerin birlikte gerçekten çalışıp çalışmadığını anlayacağız.

```text
register
↓
login
↓
protected request
↓
refresh
↓
logout
```

## Örnek 2

Her endpoint ayrı ayrı doğru olsa bile cookie veya token yaşam döngüsündeki bağlantı bozuk olabilir.

Bu yüzden integration testte aynı client agent'ını kullanacağız.

---

Ada'nın giriş yolculuğunu beş ayrı ekran görüntüsü gibi düşünelim: (1) kayıt olur, (2) doğru parolayla giriş yapar, (3) kimliğini gerektiren sayfaya ulaşır, (4) süresi biten erişim belirtecini yeniler, (5) çıkış yapar. Her isteğin başarısı bir sonraki adımı garanti etmez. **Örneğin çıkış `200` dönmesine rağmen eski yenileme belirteci hâlâ kullanılabiliyorsa oturum güvenli biçimde sonlandırılmış değildir.** Bu yüzden testte önceki belirteci özellikle saklayacağız.

## JWT Logout Davranışını Netleştirelim

Token mimarisinde logout sırasında:

```text
refresh cookie'deki raw token'ı al
↓
hash ile DB kaydını bul
↓
aktif token'ı revoke et
↓
access + refresh cookie'leri temizle
```

## Örnek 3

Service:

JWT ile çıkışta yenileme kaydını iptal eden bu Service parçasının yeri `src/services/auth.js` dosyasıdır. Mevcut oturum tabanlı Controller’daki `logoutUser` ile aynı şey değildir; Router/Controller bağları kurulmadan bu kod tek başına çıkış yolunu tamamlamaz.

```js
export const logout = async (rawRefreshToken) => {
  if (!rawRefreshToken) {
    return;
  }

  const tokenHash = hashToken(rawRefreshToken);

  await RefreshToken.findOneAndUpdate(
    {
      tokenHash,
      revokedAt: null,
    },
    {
      $set: { revokedAt: new Date() },
    },
  );
};
```

## Örnek 4

Controller her durumda cookie'leri temizleyip `204` dönebilir.

Bu davranışı şimdi test edeceğiz.

---

## Test İskeleti

Uçtan uca denemeleri yeni `test/auth-flow.test.js` dosyasında birleştirebilirsiniz. Aşağıdaki parçalar **aynı test dosyasına** aittir; bağlantı ve veri temizleme işlemleri yalnız güvenli test veritabanı ayarları hazırsa çalıştırılmalıdır.

```js
import {
  describe,
  it,
  beforeEach,
} from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

import { app } from "../src/server.js";
import { User } from "../src/db/models/user.js";
import { RefreshToken } from "../src/db/models/refreshToken.js";
```

## Örnek 5

Bu temizleme işlemi **yalnızca test veritabanı bağlantısı kurulduktan sonra** çalıştırılmalıdır. Aşağıdaki `deleteMany({})` çağrılarını canlı veritabanında denemeyin. Güvenli bağlantı ve ortam korumasını 64. bölümde kuracağız.

Her testten önce ayrı test veritabanındaki örnek kayıtları temizleyebiliriz:

```js
beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    RefreshToken.deleteMany({}),
  ]);
});
```

## Örnek 6

---

Ada'nın giriş yolculuğunu birbirinden bağımsız dört isteğe bölmek kolaydır; fakat asıl risk, bu isteklerin **aynı kullanıcı oturumu içinde** birbirini doğru izlemesidir. Örneğin giriş başarılı olsa bile tarayıcı yenileme çerezini taşımıyorsa sonraki adım başarısız olur. Bu nedenle testte aynı `request.agent()` nesnesini kullanacağız: Ada'nın tarayıcısı gibi çerezleri saklar, sonra ilgili isteğe geri ekler. Testin sırasını da bu yüzden rastgele değiştirmeyeceğiz.

## Tam Akış

```js
it("register-login-me-logout akışı çalışır", async () => {
  const agent = request.agent(app);

  const registerResponse = await agent
    .post("/auth/register")
    .send({
      name: "Ada",
      email: "ada@example.com",
      password: "uzun-bir-test-parolasi",
    });

  assert.equal(registerResponse.status, 201);

  const loginResponse = await agent
    .post("/auth/login")
    .send({
      email: "ada@example.com",
      password: "uzun-bir-test-parolasi",
    });

  assert.equal(loginResponse.status, 200);

  const meResponse = await agent
    .get("/users/me");

  assert.equal(meResponse.status, 200);
  assert.equal(
    meResponse.body.data.email,
    "ada@example.com",
  );

  const logoutResponse = await agent
    .post("/auth/logout");

  assert.equal(logoutResponse.status, 204);
});
```

## Örnek 7

---

Ada'nın kayıt, giriş ve çıkış yollarını ayrı ayrı test etmemiz önemli; fakat aralarındaki ilişkiyi de sınamalıyız. Ada giriş yaptıktan sonra `POST /auth/refresh` çalışabilir. Ardından çıkış yaptığında aynı yenileme hakkıyla tekrar access token alınabiliyorsa, çıkış yanıtının başarılı görünmesi yeterli değildir.

Bu yüzden aynı test hesabıyla **giriş → yenileme → çıkış → eski belirteçle yeniden deneme** sırasını kullanıyoruz. Son denemenin reddedilmesi, çıkışın yalnız çerez temizliği olmadığını; sunucudaki yenileme hakkının da sonlandırıldığını gösterir.

Ada “Çıkış yap” dediğinde yalnız ekranda giriş düğmesinin görünmesi yeterli değildir. Çıkış öncesinde sunucunun verdiği yenileme belirteci artık yeniden kullanılamamalıdır. Bu yüzden testte çıkıştan önce elde ettiğimiz kimlik bilgisini saklayıp çıkıştan **sonra aynı belirteçle** yenileme isteği göndereceğiz; reddedildiğini göreceğiz. Kısa ömürlü erişim JWT'sinin çerezden silinmesi ile sunucuda geçersiz kılınması farklı kontrollerdir.

## Logout Sonrası Refresh Başarısız Olmalı

Testin önemli güvenlik assertion'ı:

```js
const refreshResponse = await agent
  .post("/auth/refresh");

assert.equal(refreshResponse.status, 401);
```

## Örnek 8

Cookie temizliği agent tarafından uygulanmışsa refresh cookie gelmez.

Ek olarak database'deki refresh kaydının `revokedAt` değerini kontrol edebiliriz.

---

Ada girişte R1 aldı, yenileyince R2 aldı ve sonra çıkış yaptıysa test yalnız çerezlerin temizlendiğini kontrol etmemeli. **R2'yi saklayıp çıkıştan sonra yeniden `/auth/refresh` yoluna göndermeyi deneyelim:** yenileme hakkı sunucuda iptal edildiyse istek reddedilmelidir. Buna karşılık daha önce verilmiş kısa ömürlü access JWT'sinin anında reddi, kodda ayrıca iptal veya sürüm kontrolü varsa garanti edilebilir. Test beklentisini henüz kurmadığımız bir mekanizmanın varlığına dayandırmayalım.

## Yanlış Parola Senaryosu

```js
const response = await request(app)
  .post("/auth/login")
  .send({
    email: "ada@example.com",
    password: "yanlis-parola",
  });

assert.equal(response.status, 401);
assert.equal(
  response.body.message,
  "E-posta veya parola hatalı.",
);
```

## Örnek 9

Olmayan email için de aynı public mesajı bekleriz.

Bu user enumeration savunmasını regresyon testine dönüştürür.

---

Yenileme testinde R1'i önce kullanıp R2'yi aldığımızda, test istemcisinin çerezi artık R2 olabilir. Sadece istemciyi tekrar çağırırsak yanlışlıkla **R1'i yeniden kullanmayı değil, R2 ile normal yenilemeyi** test etmiş oluruz. Çalınmış eski token senaryosunu sınamak için **ilk R1 değerini ayrıca saklayıp** ikinci isteğe bilinçli olarak R1'i eklemeliyiz. Böylece “kullanılmış token yeniden kabul edilmiyor” iddiasını gerçekten kontrol ederiz.

## Yenileme Belirteci İkinci Kez Kullanılırsa Ne Olur?

Daha ileri testte ilk refresh cookie değerini kaydedip:

```text
R1 ile refresh → başarılı, R2 geldi
R1'i tekrar kullan → 401 + family revoke
```
