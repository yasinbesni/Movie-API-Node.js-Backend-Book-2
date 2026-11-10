# Bölüm 28 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

ruz: Korunmuş API istekleri için **kısa ömürlü** kimlik bilgisi; bu süre bittiğinde devam edebilmek için **ayrı denetlenen** yenileme hakkı. İkisini aynı uzun ömürlü bearer token'a yüklemiyoruz.

**Refresh token (yenileme belirteci)**, yeni bir access token istemek için kullanılan ayrı bir kimlik bilgisidir. Korumalı film verisini doğrudan okumaya veya değiştirmeye yetki vermez. Buna karşılık yenileme isteğinde kabul edildiğinde **dolaylı olarak yeni erişim sağlayabildiği için çok hassas bir sırdır**.

Buradaki kontrol şudur: `/auth/refresh`, “Bana süresi biten access token'ı göster, yenisini vereyim” demez. “**Geçerli bir refresh token sun; hakkın sürüyorsa yeni access token üretirim**” der. Dolayısıyla access token'ın ele geçirilmesi ile refresh token'ın ele geçirilmesi farklı sonuçlar doğurur.

Örneğin Ada 14. dakikada film kataloğunu inceliyorsa erişim belirteci çalışır. Süre dolduktan sonra API isteği eski access token'la reddedilebilir. Uygulama, izin verilen yenileme işlemini kullanarak **Ada'dan parolasını tekrar istemeden** yeni bir erişim belirteci almayı deneyebilir. Bunun olabilmesi için refresh token'ın da **geçerli, süresi dolmamış ve iptal edilmemiş** olması gerekir.

```text
Access token: Film API'sine kısa süreli erişim
Refresh token: Yeni access token isteme
```

## Örnek 2

değiştiren yollar için CSRF korumasını, istemci tarafında güvenli içerik işlemeyi ve uygun CSP ayarını ayrıca uygulayıp test etmeliyiz. Hesap ele geçirildiğinden şüphelenirsek yenileme hakkını iptal etmek, gerekli durumlarda yeniden giriş istemek ve olayı gizli token'ları kaydetmeden incelemek de bu bütünün parçasıdır.

Böylece üç durumu birbirinden ayırabiliriz: **Sahte bir başka-site isteğini engellemek**, **Ada'nın sayfasında zararlı kod çalışmasını önlemek** ve **çalınmış R1'in başka cihazdan tekrar kullanılmasını sınırlamak** farklı korumalar gerektirir. Her biri kendi saldırı yolunu kapatır; hiçbiri tek başına hepsini çözmez.

Bu aşamada `POST /auth/refresh` henüz çalışmıyor; yenileme hakkının sunucuda nasıl denetleneceğini kurduktan sonra bu yolu oluşturacağız.

## Yenileme Belirteci de JWT Olmak Zorunda mı?

Hayır. Movie API'de yenileme belirtecini rastgele üretilmiş, anlam taşımayan bir değer (*opaque token*) olarak kullanacağız. Yani Ada'nın ID'sini token'ın içine yazmayacağız. Hangi kullanıcıya ait olduğunu veritabanındaki kayıttan bulacağız.

26. bölümde hazırladığımız `src/utils/token.js` dosyasına şu **iki fonksiyonu ekliyoruz**; mevcut JWT fonksiyonlarını silmiyoruz:

```js
import { randomBytes, createHash } from "node:crypto";

export const createRefreshToken = () =>
  randomBytes(48).toString("base64url");

export const hashToken = (token) =>
  createHash("sha256")
    .update(token)
    .digest("hex");
```

## Örnek 3

Bu kodu aynı dosyada kullanırken `node:crypto` import'unu en üste koyacağız. `randomBytes(48)`, tahmin edilmesi çok zor **48 rastgele bayt** üretir. `base64url`, bunları bir URL ve çerez içinde taşınabilen metne çevirir; **gizlemez veya şifrelemez**. Güvenlik, uzun ve rastgele üretilmiş değerin tahmin edilememesinden gelir.

`hashToken()` ise gelen belirteçten **SHA-256 hash değeri** hesaplar. Örneğin R1'i iki kez bu fonksiyona verirsek iki seferde de aynı sonuç çıkar. Bu sonuç R1'in kendisi değildir; veritabanında `tokenHash` alanına yazacağımız, R1'i daha sonra tanımamızı sağlayan değerdir.

## Raw Token'ı Neden Veritabanına Kaydetmiyoruz?

Ada'ya gönderdiğimiz asıl yenileme belirtecini (**raw token / ham belirteç**) veritabanına düz metin hâlinde yazarsak, veritabanını gören biri onu kullanabilir.

Bunun yerine R1'den hesaplanan **SHA-256 hash değerini** saklayacağız:

```text
Ada'nın tarayıcısı: ham yenileme belirteci
                     ↓
Sunucu: SHA-256 hash değerini hesapla
                     ↓
MongoDB: yalnız tokenHash
```
