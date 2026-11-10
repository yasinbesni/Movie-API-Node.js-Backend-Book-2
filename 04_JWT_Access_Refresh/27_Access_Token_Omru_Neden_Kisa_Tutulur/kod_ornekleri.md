# Bölüm 27 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

a'nın uygulamayı kullanma kolaylığıyla birlikte değerlendireceğiz.

## Saldırganın Elindeki Access Token Ne Kadar İşe Yarar?

Ada saat **10.00'da** Movie API'ye giriş yapmış ve **10.15'te** sona erecek bir access token almış olsun. Saat **10.05'te** bir saldırgan bu token'ın kopyasını ele geçiriyor. Sunucu yalnızca geçerli bearer token'a bakarak kimlik doğruluyorsa, saldırgan **10.05–10.15** arasında Ada'nın izin verilen kaynaklarına istek gönderebilir. Token'ın imzası hâlâ doğrudur; onu hangi kişinin gönderdiğini imza tek başına söylemez.

Saat 10.15'i geçtiğinde `exp` kontrolü bu token'ı reddeder. Saldırganın elinde **yalnız bu access token** varsa, `/auth/refresh` isteğini onunla başarıyla tamamlayamaz; çünkü bu yol **başka bir kimlik bilgisi olan refresh token'ı** arar. Ancak saldırgan refresh token'ı da ele geçirmişse risk burada bitmez. Bu ayrımı aşağıdaki bölümlerde ayrı ayrı izleyeceğiz.

## Geçerlilik Süresini Kısaltmak Neyi Değiştirir?

Bir belirteç çalındığında onun ele geçirildiği anı önceden bilemeyiz. Kısa geçerlilik süresi, fark edilmemiş bir hırsızlıkta bile eski belirtecin kullanılabileceği **üst süreyi daraltır**; ancak o süre içinde yapılan istekleri geri alamaz.

```text
Uzun süre geçerli belirteç
→ ele geçirilirse uzun risk süresi

Kısa süre geçerli belirteç
→ risk süresi daralır
```

## Örnek 2

Örneğin bir belirtecin ömrü **bir hafta** olsaydı, çalındığını ilk gün fark etmesek bile saldırgan günlerce denemeye devam edebilirdi. **15 dakika** seçtiğimizde kullanım penceresini daraltıyoruz; yine de o 15 dakika boyunca yapılabilecek isteklerin riskini yok etmiyoruz. Kısa süre, tek başına hırsızlığı önleyen bir kilit değildir.

## Neden 15 Dakika?

Token ömrü için **15 dakikayı** seçtik. Bu bir güvenlik garantisi değil, risk ile kullanım kolaylığı arasında Movie API için belirlediğimiz örnek dengedir.

`src/utils/token.js` içinde şunu yazdık:

```js
expiresIn: "15m",
```

## Örnek 3

nı şey parola değişikliği için de geçerli: Ada parolasını değiştirdi diye daha önce imzalanmış bir JWT'nin `exp` değeri otomatik değişmez. Bu nedenle erişim belirtecini kısa ömürlü tutuyoruz. Hesap durumu ve token iptali ise ayrıca kontrol edilmesi gereken konular olarak kalıyor.

On beş dakikayı somutlaştırmak için Ada'nın erişim belirtecinin beşinci dakikada ele geçirildiğini düşünelim. Başka bir kontrol yoksa saldırganın token'ı kullanabileceği süre **yaklaşık on dakika** daha olabilir. Süreyi bir dakikaya indirmek bu aralığı daraltır; fakat Ada'nın tarayıcısı çok daha sık yenileme yapmak zorunda kalır. Bir haftalık token daha az yenileme gerektirir, ama çalındığında risk çok daha uzun sürer.

Demek ki `15m`, sihirli bir güvenlik değeri değil; risk ve kullanım kolaylığı arasında seçtiğimiz örnek bir dengedir. Token süresini sınırlamak önemlidir, ancak geçerlilik süresince çalınan belirtecin kullanılmasını tek başına önlemez.

## Bir Deneme Yapalım

**Yalnızca yerel test için** `expiresIn` değerini geçici olarak `"5s"` yapalım. Token üretip hemen doğruladığımızda başarılı olmasını bekleriz. Birkaç saniye sonra aynı token'ı tekrar doğruladığımızda süre dolduğu için hata almalıyız.

```text
Belirteç üretildi → geçerli
Süre doldu        → doğrulama reddedildi
```
