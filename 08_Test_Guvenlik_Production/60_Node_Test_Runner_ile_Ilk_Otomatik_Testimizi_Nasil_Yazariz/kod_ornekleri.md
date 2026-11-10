# Bölüm 60 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

 yeniden sınamak istediğimizi belirledik. Önce bütün HTTP akışını kurmak yerine küçük ve izole bir davranışla başlayacağız: doğru parola kabul ediliyor, yanlış parola reddediliyor mu? **`node:test` denemeleri çalıştıracak; `assert` ile yazdığımız beklentiler ise sonucun doğru olup olmadığını söyleyecek.** Bu küçük kontrol daha kapsamlı testlerin temelini oluşturacak.

## Test Runner Artık Node.js'in İçinde

Diyelim ki parola doğrulama kodunu değiştirdik. Ada'nın doğru parolası kabul edilmeli, yanlış parola reddedilmeli. Bu iki davranışı her seferinde elle sınamak yerine bir test dosyası çalıştırabiliriz.

Bunun için ayrıca bir test kütüphanesi kurmamız gerekmiyor. Node.js'in kendi test çalıştırıcısı olan `node:test` ile başlayacağız. **Neden önce küçük bir yardımcı fonksiyonu test ediyoruz?** Çünkü `hashPassword()` doğru çalışmıyorsa HTTP endpoint'inin verdiği hatayla uğraşmadan, sorunun parola işleminin kendisinde olduğunu hemen görürüz. Böylece testin nasıl sonuç bildirdiğini de daha az hareketli parçayla öğreniriz. Önce tek bir fonksiyonu sınayalım; 61. bölümde gerçek HTTP isteklerine geçtiğimizde testin nasıl çalıştığını zaten biliyor olacağız.

---

## İlk Test Dosyası

Dosya:

```text
test/password.test.js
```

## Örnek 2



```js
import test from "node:test";
import assert from "node:assert/strict";

import {
  hashPassword,
  verifyPassword,
} from "../src/utils/password.js";

test("hashlenen parola doğrulanabilir", async () => {
  const password = "uzun-bir-test-parolasi";

  const hash = await hashPassword(password);

  const result = await verifyPassword(
    hash,
    password,
  );

  assert.equal(result, true);
});
```

## Örnek 3

Yanlış parola testi:

Bu ikinci testi aynı `test/password.test.js` dosyasına, ilk testin altına ekleyin; tek bir örnek için ikinci bir test dosyası oluşturmanıza gerek yok.

```js
test("yanlış parola doğrulanmaz", async () => {
  const hash = await hashPassword(
    "dogru-parola-123",
  );

  const result = await verifyPassword(
    hash,
    "yanlis-parola-123",
  );

  assert.equal(result, false);
});
```

## Örnek 4

---

Test dosyasındaki `test(...)` ifadesi **hangi davranışı sınadığımızı** adlandırır; `assert` ise sonucun beklediğimiz gibi olup olmadığını kontrol eder. Örneğin Ada'nın parolası doğruysa doğrulama sonucu `true` olmalı, yanlışsa `false` olmalı. `assert` başarısız olduğunda test çalıştırıcısı hangi kontrolün bekleneni karşılamadığını gösterir.

Bu ilk testte API'ye HTTP isteği göndermiyoruz. **Sınadığımız parça parola yardımcı fonksiyonu.** Yani test başarılı olsa bile `/auth/login` yolunun, çerezin ve MongoDB bağlantısının doğru çalıştığını henüz söyleyemeyiz. Bunları 61–62. bölümlerde birlikte sınayacağız.

## Testleri Çalıştırmak

`package.json`:

```json
{
  "scripts": {
    "test": "node --test"
  }
}
```

## Örnek 5

Terminal:

```bash
npm test
```

## Örnek 6

Node.js, test dosyalarını belirli dosya adı kalıplarına göre bulur. Biz dosyalarımızda şu uzantıyı kullanacağız:

```text
*.test.js
```

## Örnek 7

---

## `assert` Ne Yapıyor?

`assert` yalnız bir değere bakmaz; **beklediğimiz sonuçla gerçekleşen sonucu karşılaştırır**. Örneğin yanlış parola doğrulamasında `false` bekliyorsak ama fonksiyon `true` döndürüyorsa test başarısız olmalı. Böylece “kod hata vermedi” ile “kod doğru davranıyor” arasındaki farkı görürüz.

Burada görevler ayrıdır: `node:test` testleri bulur ve çalıştırır; `node:assert/strict` ise karşılaştırma başarısızsa testin hata vermesini sağlar. **Testin çalışmasıyla kontrolün başarılı olması aynı şey değildir.**

Örneğin:

```js
assert.equal(result, true);
```

## Örnek 8

`result` değeri `true` değilse test başarısız olur.

Başka assertion örnekleri:

```js
assert.equal(actual, expected);
assert.deepEqual(actualObject, expectedObject);
assert.ok(value);
assert.rejects(asyncFn);
```

## Örnek 9

---

## `describe` ve `it`

Node test runner daha okunabilir gruplama için:

```js
import { describe, it } from "node:test";

import assert from "node:assert/strict";

describe("password utils", () => {
  it("doğru parolayı kabul eder", async () => {
    // ...
  });
});
```

## Örnek 10

şeklinde de kullanılabilir.

Tek bir davranışı sınamak için `test()` yeterli. Birbiriyle ilişkili testleri bir arada görmek istediğimizde `describe()` ve `it()` ile gruplar oluşturabiliriz.

---

## Testten Önce Hazırlık, Testten Sonra Temizlik

Database testlerinde:

```js
before()
after()
beforeEach()
afterEach()
```

## Örnek 11

hook'larına ihtiyacımız olacak.

Örneğin:

```js
import {
  before,
  after,
  beforeEach,
} from "node:test";
```

## Örnek 12

Bunlarla test başlamadan önce veritabanı bağlantısını açabilir, gereken deneme kayıtlarını hazırlayabilir ve test bittikten sonra bağlantıyı kapatabiliriz. **Hazırlık (setup)** ile **temizlik (teardown)** böyle iki farklı görevi yerine getirir. Bu işlemler yalnız ayrılmış test veritabanında çalışmalıdır.

---

## Tek Bir Fonksiyonun Testi Neyi Kanıtlar?

`node:test`, yazdığımız denemeleri çalıştıran araçtır; `assert`, çıkan sonucu beklediğimiz değerle karşılaştırır. Ada'nın parolasıyla yaptığımız testte `hashPassword()` ve `verifyPassword()` fonksiyonlarını doğrudan çağırıyoruz. Böylece **parola yardımcı kodunun** doğru çalıştığını öğreniyoruz; ancak henüz `POST /auth/login` isteğinin Router, Joi kontrolü, Controller ve Service katmanlarından geçerek doğru yanıt verdiğini kanıtlamıyoruz.

İki test türüne ihtiyaç duymamızın nedeni bu kapsam farkıdır. Küçük test, sorunun tek bir fonksiyonda olup olmadığını hızlı gösterir. HTTP testi ise parçaların birlikte davranışını kontrol eder.

Bu küçük test şu HTTP akışını tek başına sınamaz:

```text
POST /auth/login
↓
Joi
↓
service
↓
cookie
↓
Response
```
