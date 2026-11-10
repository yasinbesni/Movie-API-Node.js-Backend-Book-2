# Bölüm 1 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# Kullanıcılar Geldiğinde API Neden Değişir?

## Movie API Çalışıyor. Ama Bir Şey Eksik.

Başlangıçtaki Movie API ile film ekleyebiliyor, listeleyebiliyor, güncelleyebiliyor ve silebiliyoruz. Şimdi bu uygulamayı yeniden kurmak yerine yeni bir ihtiyaca cevap vereceğiz.

Artık birisi `GET /movies` isteği gönderdiğinde karşısına film listesi çıkıyor. *Interstellar* da o listede olabilir.

Bu kez listeden bir film seçen Ada, başka bir şey yapmak istiyor:

> “Bunu hafta sonu izleyeceğim. Kendi listeme kaydedebilir miyim?”

İstek oldukça doğal. Bir filmi bulmak başka, **o filmi daha sonra izlemek üzere kendine ayırmak** başka bir ihtiyaç.

Mevcut Movie API Ada'ya filmleri gösterebilir. Fakat henüz “Ada'nın listesi” diye bir şey bilmiyor.

Çünkü şimdiye kadar filmler vardı; onları kullanan **hesaplar** yoktu.

---

## Aynı Filme Bakan İki Kişi

Ada *Interstellar*'ı listesine eklemek istiyor. Aynı sırada Deniz de filmi buluyor ama kendi listesine eklemiyor.

İki kişi de aynı endpoint'i kullanabiliyor:

```http
GET /movies
```

## Örnek 2

Sunucu, iki isteğe de film verilerini döndürebilir. Buraya kadar sorun yok.

Ancak bir sonraki adımda cevaplar farklı olmalı:

```text
Ada'nın listesi       → Interstellar var
Deniz'in listesi      → Interstellar yok
```

## Örnek 3

Bunu yapabilmek için sunucunun yalnızca **hangi filmin istendiğini** değil, **işlemin hangi hesaba ait olduğunu** da bilmesi gerekir.

Burada çözmemiz gereken soru şu: API'ye kullanıcılar geldiğinde onları nasıl tanıyacağız?

---

## Bir Request Bize Ne Söylüyor?

Şimdiye kadar şu isteği rahatça işliyorduk:

```http
POST /movies
Content-Type: application/json
```

## Örnek 4



```json
{
  "title": "Interstellar",
  "releaseYear": 2014,
  "voteAverage": 8.7
}
```

## Örnek 5

Body'de filmin bilgileri bulunuyor. Fakat burada isteği kimin gönderdiğine ilişkin güvenilir bir kanıt yok.

İsteği Postman'den göndermemiz, tarayıcıdan göndermemiz veya bir kişinin “Ben Ada'yım” demesi bu eksikliği kendiliğinden gidermez.

Sunucunun bağlantıya ilişkin bir IP adresi görmesi de yeterli değildir. Aynı ağdaki iki kişi aynı dış IP'yi kullanabilir; bir kişinin IP'si zamanla değişebilir.

**Bağlantının nereden geldiğini bilmek, hangi kullanıcı hesabıyla işlem yapıldığını bilmek değildir.**

Ada ile Deniz aynı filmi sorguladığında sunucu aynı katalog bilgisini verebilir. Kişisel liste isteğinde ise eksik olan bilgi artık belirleyici:

```text
Request geldi
     ↓
Hangi işlem isteniyor?       → biliyoruz
Hangi veri gönderilmiş?      → biliyoruz
Bu işlem hangi hesaba ait?   → henüz bilmiyoruz
```

## Örnek 6

---

## Film Kaydıyla Kullanıcı Hesabı Farklı Şeyler

Veritabanımızda her filmi temsil eden bir `Movie` kaydı bulunuyor. Bu kayıtlar filmin başlığı, türü ve diğer bilgilerini saklıyor.

Şimdi bir de `User` adında bir kayıt türüne ihtiyacımız olacak. Bu kayıt, bir film değil, uygulamadaki bir hesabı temsil edecek.

Örneğin şimdilik şunu hayal edebiliriz:

```json
{
  "name": "Ada",
  "email": "ada@example.com"
}
```

## Örnek 7

Bu henüz oluşturacağımız kesin veritabanı modeli değil. Yalnızca bir hesabı bir diğerinden ayırabilmemiz için ilk düşüncemiz.

Bir filmin adı, yılı ve puanı olmasıyla bir hesabın adı ve e-posta adresinin olması aynı tür veri değildir. Üstelik hesabın başka kişiler tarafından kullanılmasını da engellemek isteyeceğiz.

Bu yüzden kullanıcı eklemek, `Movie` modeline birkaç alan daha eklemekten ibaret olmayacak.

---

## Kullanıcıyı Tanımak Neden Yeterli Olmayacak?

Ada'nın bir hesabı olduğunu varsayalım. Uygulama onu tanımayı başardı.

Peki Ada şu isteği gönderirse ne olacak?

```http
DELETE /movies/66f123456789abcdef123456
```

## Örnek 8

Film gerçekten veritabanında olabilir. ID geçerli olabilir. İstek teknik olarak doğru biçimde hazırlanmış olabilir.

Yine de tek başına bunlar silmeye izin vermek için yeterli değildir.

Bir kişinin kim olduğunu bilmek, **o kişinin her filmi silebileceği** anlamına gelmez.

İşte kullanıcılar geldiğinde cevaplamamız gereken iki ayrı soru ortaya çıkar:

```text
Bu isteği hangi hesap gönderiyor?
                   ↓
Bu hesap istenen işlemi yapabilir mi?
```

## Örnek 9

İkinci soruya geçebilmek için önce birinci soruyu güvenilir biçimde çözmemiz gerekir.

---

## Mevcut Projeyi Atmıyoruz

İyi haber şu: Başka bir API yazmaya başlamıyoruz.

Mevcut Movie API'nin yapısı hâlâ işimize yarıyor:

```text
Router → Controller → Service → Model → MongoDB
```

## Örnek 10

Movie API, gelen isteği ilgili işleme yönlendirir ve gerektiğinde veritabanındaki kayıtlarla çalışır. Şimdi bu akışa, istek ilgili işleme ulaşmadan önce **hesapla ilgili yeni kararlar** ekleyeceğiz.

Değişen şey, bazı işlemlerden **önce yeni kararlar** vermek zorunda olmamız.

Film listesini herkes görebilir mi? Hesap oluşturmak isteyen birine ne soracağız? Kişisel bir listeyi yalnızca sahibi mi görebilecek? Bunlar uygulamamızın vereceği ürün ve güvenlik kararlarıdır.

Ada'nın kendi listesine ulaşabilmesi için önce bir hesabı olacak, sonra da o hesabı kullanan kişinin gerçekten giriş yaptığını doğrulayacağız. Listeyi kimlerin görebileceği sorusuna ancak bundan sonra güvenilir bir cevap verebiliriz.

Şu anda ihtiyacımız olan şey yeni bir paket değil: Ada'nın hesabını Deniz'inkinden ayırabilmek.

---

## Şu Anda Ne Yapabiliriz?

Movie API'yi açıp `GET /movies` isteğini gönderebilirsiniz. Dönen filmler, kimin gönderdiğine bakılmaksızın aynı ortak veri kaynağından gelir.

Ardından zihninizde iki ayrı liste düşünün:

```text
Ada   → İzleyeceklerim: Interstellar
Deniz → İzleyeceklerim: (boş)
```
