# Bölüm 47 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# Parolamı Unuttum İsteği Nereden Başlamalı?


## Ada Parolasını Unutursa Hangi Bilgiye Güvenebiliriz?

E-posta bağlantısını tek kullanımlık doğrulama için tasarladık. Şimdi Ada'nın parolasını unuttuğunu düşünelim: Sunucu eski parolayı ona gönderemez; zaten düz metin parolasını saklamaması gerekir. **Bunun yerine, posta kutusuna erişimini kullanarak kontrollü bir parola sıfırlama süreci** başlatacağız. Yanıtın bir hesabın sistemde var olup olmadığını ifşa etmemesi de bu akışın parçası.

## Ada Bu Kez Giriş Yapamıyor

Ada film listesine geri dönmek istiyor ama parolasını hatırlamıyor. Normal giriş yolumuz parolayı doğrulayamadığı için işlemi reddediyor. Ona ikinci bir parola sormak sorunu çözmez.

Daha önce doğruladığımız e-posta kutusu burada **hesap kurtarma (account recovery)** kanalı olabilir. Ada'ya süreli bir bağlantı göndereceğiz; bağlantıyı açan kişi yeni parola belirleyebilecek. Bu, eski parolayı e-postayla göndermek demek değil.

Ancak şu soruya dikkat: Bir saldırgan `ada@example.com` adresini deneyerek böyle bir hesabın var olup olmadığını öğrenebilir mi?

## Dışarıya Hesap Varlığını Açıklamayalım

Bir hesap bulunamadığında:

```json
{ "message": "Bu adrese ait hesap yok." }
```

## Örnek 2

şeklinde yanıt vermek, hesap listesi toplamak isteyen kişiye yardımcı olur. Bunun yerine hem var olan hem olmayan adresler için aynı yanıtı seçeceğiz:

```http
HTTP/1.1 202 Accepted
```

## Örnek 3



```json
{
  "message": "Adres uygunsa parola yenileme bağlantısı gönderilecektir."
}
```

## Örnek 4

Bu yanıt **e-posta kesinlikle gönderildi** anlamına gelmiyor. Yalnızca isteğin kabul edildiğini söylüyor. Ayrıca aynı metni kullanmak tek başına her şeyi çözmez: Hesap bulunan isteğin daha uzun sürmesi de ipucu verebilir. Özellikle yüksek riskli uygulamalarda zamanlama farkları, istek hızı sınırları ve e-posta kuyruğu birlikte değerlendirilir.

Bir saldırgan “Parolamı unuttum” formuna farklı adresler yazdığında yalnız sunucunun yanıtına bakarak sistemde kimlerin hesabı olduğunu öğrenmemelidir. Bu nedenle kayıtlı ve kayıtsız adresler için dışarıya benzer yanıt vermek anlamlıdır. Ama **aynı metni döndürmek tek başına yeterli olmayabilir**; işlem süresi ve istek sınırları da hesap varlığına ilişkin ipucu verebilir. Hesap kurtarma yolunun güvenliği, kullanıcıya gösterilen mesajla sınırlı değildir.

## Gelen E-postayı Kontrol Edelim

`src/validation/auth.js` dosyasında `Joi` doğrulaması zaten kurulu. Şimdi şu şemayı ekleyin:

```js
export const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
});
```

## Örnek 5

Böylece `ADA@EXAMPLE.COM` ile `ada@example.com` aynı hesap aramasına gider. Parolada yaptığımız gibi adres biçimini kendimiz değiştirmeye çalışmıyoruz; şemadaki normalleştirilmiş değer Controller'a ulaşacak.

İsteğin adresi şöyle olacak:

```http
POST /auth/forgot-password
Content-Type: application/json
```

## Örnek 6



```json
{ "email": "ada@example.com" }
```

## Örnek 7

Bu noktada isteğin **adresini, kabul ettiği veriyi ve döneceği yanıtı** belirledik; çalışan bir e-posta gönderim yolu henüz oluşturulmadı. 48. bölümde sıfırlama belirtecini üreteceğiz. 50. bölümde e-posta servisini ve HTTP yolunu bağladığımızda Ada bu isteği gerçekten gönderebilecek.

Ada'nın gerçek adresiyle istek göndermesi ve saldırganın rastgele bir e-posta adresi denemesi, dışarıdan bakıldığında **hesap var mı yok mu sorusuna cevap vermemeli**. İki durumda da aynı genel başarı mesajını döndürmemizin nedeni bu. Ancak bu mesaj “mutlaka e-posta gönderildi” anlamına gelmez; yalnızca isteğin alındığını ifade eder.

Yanıt metni aynı olsa bile cevap sürelerinin veya gönderim sınırlamalarının hesap varlığını ele verebildiğini de düşünmeliyiz. Bu yüzden gerçek uygulamada istek hızı sınırlaması ve e-posta gönderimini yönetme kararları da hesap kurtarma akışının parçasıdır.

## Hangi Hesaba Bağlantı Göndereceğiz?

Movie API'miz için açık bir karar verelim: Kurtarma bağlantısı yalnızca e-posta adresi doğrulanmış hesaplara gönderilecek. Doğrulanmamış hesaplar da aynı genel HTTP yanıtını alacak. Böylece dışarıdan hesap durumu açıklanmamış olacak.

```text
Hesap yok               → genel yanıt
Hesap var, doğrulanmamış → genel yanıt
Hesap var, doğrulanmış   → genel yanıt + içeride kurtarma süreci
```
