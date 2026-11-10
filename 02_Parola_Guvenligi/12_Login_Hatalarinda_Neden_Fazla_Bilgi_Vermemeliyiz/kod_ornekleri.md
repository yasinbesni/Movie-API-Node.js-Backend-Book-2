# Bölüm 12 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# Login Hatalarında Neden Fazla Bilgi Vermemeliyiz?

## Ada Bir Harfi Yanlış Yazdı

Ada giriş yapmak için parolasını yazdı ama sonunda bir harfi eksik bıraktı. Ekranda doğal olarak bir hata görecek. Burada uygulamanın ona yardımcı olması gerekiyor.

İlk akla gelen iki mesaj şöyle olabilir:

```text
Bu e-posta kayıtlı değil.
```

## Örnek 2

veya:

```text
Parolanız yanlış.
```

## Örnek 3

İkisi de anlaşılır. Ama bu mesajları yalnızca Ada görmüyor; `/auth/login` adresine istek gönderen herkes aynı yanıtları alabiliyor.

Bir kişi Ada'nın e-posta adresini tahmin ederse, farklı yanıtları karşılaştırarak hangi hesabın gerçekten var olduğunu anlayabilir. Bu nedenle giriş ekranında **hangi bilginin yanlış olduğunu açıklamak** her zaman doğru tercih değildir.

## İki Ayrı Hata, Dışarıda Tek Yanıt

On birinci bölümde iki kontrolümüz vardı: önce kullanıcıyı buluyor, ardından parolayı doğruluyorduk. Kod içeride hangi adımın başarısız olduğunu bilir.

Ancak dışarıya her iki durumda da şu yanıtı gönderebiliriz:

```http
401 Unauthorized
```

## Örnek 4



```json
{
  "message": "E-posta veya parola hatalı."
}
```

## Örnek 5

Ada'nın e-posta adresini bilen birinin iki yanıtı karşılaştırdığını düşünelim: “Hesap bulunamadı” ile “Parola yanlış” ayrımı, kayıtlı adresleri tek tek keşfetmesine yarayabilir. İki duruma aynı `401` yanıtını vermek bu bilgi sızıntısını azaltır. Bu tehlike, güvenlikte **hesap varlığını öğrenme (user enumeration)** olarak adlandırılır.

Kodumuzda iki dal bulunabilir; fakat ikisi aynı hatayı oluşturur:

Aşağıdaki fonksiyon, aynı hata mesajını neden kullandığımızı göstermek için verilmiştir. Gerçek giriş işlevini 13. bölümde `src/services/auth.js` içinde kuracağız; bu parçayı ayrı bir Controller dosyası olarak oluşturmayın.

```js
const invalidCredentials = () => {
  const error = new Error("E-posta veya parola hatalı.");
  error.status = 401;
  return error;
};
```

## Örnek 6

x` hata desteği eklemiştik.

**İstek henüz Joi doğrulamasından geçemiyorsa** bu başka bir durumdur: Eksik ya da biçimi bozuk alan için `400 Bad Request` dönebilir. Burada aynı olması gereken yanıtlar, *geçerli biçimde gönderilen fakat yanlış olan kimlik bilgilerine* aittir.

## 401 ve 403'ü Karıştırmayalım

`401 Unauthorized`, sunucunun isteği geçerli kimlik bilgileriyle doğrulayamadığını anlatır. Henüz kimin işlem yapmak istediğinden emin değiliz.

`403 Forbidden` ise farklıdır: İsteği yapan hesabı tanıyor olabiliriz ama bu hesabın istenen işlemi yapmaya yetkisi yoktur. Yani `401` kimlik doğrulama, `403` ise erişim izniyle ilgilidir.

Örneğin Ada kendi hesabına giriş yapamazsa `401` yanıtı alır. Deniz, giriş yaptığı hâlde Ada’nın özel listesine erişmek isterse sunucu isteği reddeder: Yetkilendirme politikasına göre `403` dönebilir veya kaydın varlığını açıklamamak için `404` tercih edilebilir. 41. bölümde bu iki yanıtın güvenlik farkını uygulama üzerinde değerlendireceğiz.

## Aynı Mesaj Her Riski Bitirir mi?

Hayır. Kullanıcı bulunamadığında sorgu erken bitebilir; kullanıcı bulunduğunda ise Argon2 doğrulaması zaman alır. Yanıtların süreleri bazı koşullarda farklı gözlemlenebilir.

```text
Hesap yok         → parola doğrulaması çalışmaz
Hesap var, yanlış → parola doğrulaması çalışır
```

## Örnek 7

Bu farkın güvenlikte ayrıca değerlendirilmesi gerekir. Her uygulamada tek çözüm aynı değildir; örneğin uygun sistemlerde sabit, geçerli bir örnek hash üzerinde doğrulama yaparak zaman farkını azaltmak değerlendirilebilir. Fakat bu adımı şimdi login kodumuza ekleyip konuyu dağıtmayacağız: Önce güvenilir HTTP davranışını oluşturacağız, ardından test ve güvenlik bölümlerinde riskleri tekrar ele alacağız.

Bir de saldırganın defalarca giriş denemesi problemi var. Tek tip hata mesajı binlerce denemeyi kendi başına durdurmaz. Temel Movie API'de gördüğümüz rate limiting yaklaşımı kimlik doğrulama yollarında da önemlidir; gerçek ortamda hesap bazlı deneme sınırları ve izleme gibi ek önlemler gerekir.

## Peki Sunucu Hiçbir Ayrıntıyı Bilmeyecek mi?

Sunucu başarısızlığın hangi aşamada olduğunu güvenlik amaçlı takip edebilir. Ancak loglara ham parola, hash, session kimliği veya token yazılmamalıdır.

Örneğin kayıt altına alınabilecek şey:

```text
AUTH_LOGIN_FAILED
reason: INVALID_PASSWORD
```

## Örnek 8

olabilir. Bu olay bilgisini görmekle parolanın kendisini kaydetmek aynı şey değildir. Log erişimi ve saklama politikası da ayrıca korunmalıdır.

## Ada'ya Ne Söyleyelim?

Ekranda şu mesaj yeterlidir:

```text
E-posta veya parola hatalı.
```
