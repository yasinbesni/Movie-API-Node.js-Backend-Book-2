# Bölüm 65 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

 mi? CSRF (siteler arası istek sahteciliği) tam da bu soruyla ilgilidir.

## Çerez Doğru Olsa da İstek Sahte Olabilir mi?

Ada'nın parolasını veya çerezindeki gizli değeri saldırganın öğrenmesi şart değildir. Tarayıcı, çerezin gönderilme koşulları uygunsa onu isteğe **otomatik olarak ekleyebilir**. Tehlike, Ada'nın gerçek hesabıyla gönderilmiş görünen işlemin **Ada'nın isteği olmadan başlatılmasıdır**. Bunun her tarayıcı isteğinde gerçekleşeceğini varsaymıyoruz; çerezin `SameSite` ayarı, istek yöntemi ve site ilişkisi sonucu belirler.

## `HttpOnly` CSRF'i Çözmez

Ada'nın giriş çerezinde `HttpOnly` bulunması iyi bir korumadır: Sayfanın JavaScript kodu çerez değerini doğrudan okuyamaz. Fakat bu ayar **tarayıcının çerezi isteğe eklemesini durdurmaz**. Saldırganın da çerezi görmesi gerekmez; Ada'nın tarayıcısından bir işlem başlatmaya çalışması yeterlidir.

Bu nedenle `HttpOnly`, çerezin JavaScript tarafından okunmasıyla ilgili riski sınırlar; **CSRF ise çerez kullanılarak isteğin Ada adına başlatılmasıyla** ilgilidir.

## `SameSite` Güçlü Bir Savunma Katmanıdır

Movie API'de kullandığımız `sameSite: "lax"` ayarı, çerezin başka sitelerden başlatılan birçok isteğe eklenmesini sınırlar:

```js
sameSite: "lax"
```

## Örnek 2

tlamaz. Arayüz ile API farklı sitelerdeyse `SameSite=None; Secure` gerekebilir; bu durumda ek CSRF koruması özellikle önem kazanır. Ayrıca aynı site kapsamındaki farklı alt alan adlarından kaynaklanan riskler de değerlendirilmelidir.

Bu yüzden kimlik doğrulanan ve veri değiştiren istekleri ayrıca doğrulayabiliriz. Nasıl mı? Ada'nın gerçek arayüzünün iletebildiği, yabancı sayfanın ise elde edemeyeceği **oturuma bağlı bir kontrol değeriyle**.

## Çerez Dışında Bir Doğrulama Değerini de Neden İstiyoruz?

Ada'nın tarayıcısı gerçek uygulamadan veri değiştiren bir istek gönderirken, sunucunun yalnız çereze değil, **o giriş oturumuna bağlı ek bir doğrulama değerine** de bakmasını istiyoruz. Bu değere CSRF belirteci diyebiliriz. İstekte doğru belirteç yoksa çerez geçerli olsa bile işlem reddedilebilir.

Bu amaçla kullanılan yöntemlerden biri **çift gönderim (double-submit)** yaklaşımıdır: Sunucu çerezdeki imzalı değerle isteğin özel başlığındaki değeri birlikte denetler. Ancak rastgele bir metni imzalamak tek başına yeterli değildir. İmza, sunucunun doğruladığı ve **o oturuma özgü** bir bilgiyle bağlanmalıdır. Örneğin girişte tahmin edilemez `sessionBinding` değeri ürettiğimizi düşünelim:

```text
random csrf token üret
+
server'ın doğruladığı sessionBinding
↓
HMAC hesapla
↓
imzalı değeri cookie'ye koy
↓
raw csrf token'ı frontend'e ver
```

## Örnek 3

Ada’nın arayüzü veri değiştiren istekte:

```http
X-CSRF-Token: raw-token
```

## Örnek 4

gönderir.

Sunucu, kimliği doğrulanmış oturumdan aynı `sessionBinding` değerini alır ve isteğin HTTP başlığındaki belirteç için HMAC imzasını yeniden hesaplar. Cookie'deki imza eşleşmiyorsa request reddedilir.

`sessionBinding`, e-posta adresi veya tahmin edilebilir kullanıcı kimliği gibi sabit bir alan olmamalıdır; login oturumuna özgü, server'ın güvendiği bir değer olmalıdır. Böyle bir bağlayıcı değer üretmeyen mimaride kendi yarım çözümümüzü yazmak yerine güvenilir bir CSRF kütüphanesi veya server-side synchronizer token yaklaşımı tercih etmek daha güvenlidir.

---

## CSRF Doğrulamasının Temel Mantığı

Aşağıdaki yardımcı fonksiyon yalnızca HMAC ile doğrulama değeri üretme ve karşılaştırma fikrini gösterir. `sessionBinding` değerinin **güvenilir, kimliği doğrulanmış oturumdan** geldiğini varsayıyoruz. Bu işlevler `src/utils/csrf.js` dosyasında yer alabilir; ancak `env.csrfSecret`, oturumla ilişkilendirme, isteğe uygulanan ara katman ve gerçek yanıt davranışı kurulmadan **çalışan bir CSRF savunması elde etmiş olmayız**. Burada öğrendiğimiz işlem, tamamlanmış bir Router entegrasyonu değildir.

```js
import {
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const signCsrf = (token, sessionBinding) => {
  return createHmac("sha256", env.csrfSecret)
    .update(`${sessionBinding}.${token}`)
    .digest("hex");
};

export const createCsrfPair = (sessionBinding) => {
  const token = randomBytes(32).toString("base64url");
  const signature = signCsrf(token, sessionBinding);

  return { token, signature };
};

export const verifyCsrfPair = (
  token,
  signature,
  sessionBinding,
) => {
  const expected = Buffer.from(
    signCsrf(token, sessionBinding),
    "hex",
  );
  const received = Buffer.from(signature, "hex");

  return (
    received.length === expected.length &&
    timingSafeEqual(received, expected)
  );
};
```

## Örnek 5

Doğrulama sırasında header'daki raw token ve authenticated context'teki aynı `sessionBinding` kullanılarak imza yeniden hesaplanır. Uzunluk eşitliği kontrol edildikten sonra `timingSafeEqual()` ile sabit zamanlı karşılaştırma yapılır.

Bu örnekte önemli olan `createHmac()` çağrısının kendisi değil, token'ın **oturuma bağlı** olmasıdır. Aksi halde “signed” kelimesi tasarımı otomatik olarak güvenli yapmaz.

---

## Doğrulama Değerini Neden Ayrı Bir HTTP Başlığında Gönderiyoruz?

Neden doğrulama değerini özel bir HTTP başlığında taşıyoruz? Sıradan bir HTML formu, aşağıdaki özel başlığı dilediği gibi ekleyemez:

```http
X-CSRF-Token
```

## Örnek 6

Başka bir sitedeki JavaScript bu başlığı `fetch` ile eklemeye çalışırsa tarayıcı, CORS kurallarını uygular. Movie API'nin izin vermediği bir kaynaktan gelen bu tür istekler engellenebilir. Ada'nın kendi uygulaması ise edindiği geçerli belirteci gerekli başlıkla gönderebilir. **Özel başlık ve CORS tek başına yetkilendirme yerine geçmez**; belirteci sunucuda doğrulamak ve kullanıcının işlem yetkisini ayrıca kontrol etmek gerekir.

---

## İsteğin Hangi Siteden Başlatıldığını da Denetleyebiliriz

Veriyi değiştiren `POST`, `PATCH` ve `DELETE` gibi isteklerde tarayıcının gönderdiği şu başlığa da bakabiliriz:

```text
Origin
```

## Örnek 7

başlığını izin verilen adresler listesiyle karşılaştırmak ek koruma sağlayabilir. Ancak bazı istemciler, ters proxy kullanımı veya farklı dağıtım biçimleri nedeniyle bu başlık her zaman aynı koşullarda bulunmayabilir. Bu yüzden uygulamanın gerçek ortamında hangi isteklerde beklediğimizi belirleyip test etmeliyiz.

Tek bir ayarı her saldırıya karşı yeterli sanmak yerine farklı korumaları birlikte değerlendiririz:

```text
SameSite
+
CSRF token
+
sıkı CORS
+
Origin/Fetch Metadata değerlendirmesi
```

## Örnek 8

kod, uygulamanın erişebildiği CSRF belirtecini elde etmeyi ve istek göndermeyi deneyebilir. CSRF koruması, kullanıcının **başka bir siteden başlatılan** isteklerle istismar edilmesi riskine odaklanır. XSS ise güvenilmeyen kodun uygulamanın içinde çalışmasıdır. Bu nedenle çıktıları güvenli işleme, uygun Content Security Policy (CSP) ve diğer XSS önlemleri yine gereklidir.

---

`SameSite`, `Origin` kontrolü ve CSRF doğrulama değeri aynı sorunu farklı yerlerden sınırlar. Hiçbiri tek başına bütün durumlar için sihirli çözüm değildir. **Özellikle çerezle yetkilendirilen ve veri değiştiren** `POST`, `PATCH`, `PUT` ve `DELETE` yollarını incelemeliyiz. Bizim `POST /users/me/email-change` örneğinde mevcut parola kontrolü ek bir engel olsa da, tasarımda CSRF savunmasını sırf buna güvenerek atlamamalıyız. `GET` isteklerinin veri değiştirmemesi de bu güvenlik modelinin önemli bir parçasıdır.

## Hangi İsteklerde CSRF Koruması Gereklidir?

`GET` istekleri yalnız bilgi okumalı; hesap silme veya parola değiştirme gibi yan etkiler başlatmamalıdır. Çünkü başka bir yerden açılan bağlantılar da `GET` isteği oluşturabilir. CSRF kontrolünü özellikle veri değiştiren şu yöntemler için değerlendireceğiz:

```text
POST
PUT
PATCH
DELETE
```
