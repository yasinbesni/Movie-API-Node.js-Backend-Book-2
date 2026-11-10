# Bölüm 4 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# E-posta Adresini Neden Düzenliyoruz ve Tekil Tutuyoruz?

## Ada'nın Hesabı Bir Anda İkiye mi Bölündü?

Ada hesabını açarken e-posta adresini şöyle yazıyor:

```text
Ada@Example.com
```

## Örnek 2

Bir süre sonra giriş ekranına dönüp bu kez şunu yazıyor:

```text
ada@example.com
```

## Örnek 3

Ada için ikisi de aynı e-posta adresi. Uygulamamız ise metinleri olduğu gibi karşılaştırırsa farklı değerlerle karşılaşabilir.

Bir de kayıt formuna yanlışlıkla boşluk eklenmesini düşünelim:

```text
"  ada@example.com  "
```

## Örnek 4

Kullanıcının her seferinde harf büyüklüğünü veya baştaki boşluğu düşünmesini istemiyoruz. Bu projede e-posta adresini hesap tanımlayıcısı olarak kullanacaksak önce **hangi biçimde saklayacağımıza** karar vermeliyiz.

---

## Aynı Kurala Göre Karşılaştırmak

Bu uygulama için basit bir karar alacağız:

```text
baştaki ve sondaki boşlukları kaldır
              ↓
küçük harfe dönüştür
```

## Örnek 5

JavaScript'te bu dönüşümü görmüş olabilirsiniz:

```js
const email = "  Ada@Example.com  ";

const normalizedEmail = email.trim().toLowerCase();

console.log(normalizedEmail); // ada@example.com
```

## Örnek 6

Bu işleme **normalization (normalleştirme)** diyoruz. Amacımız, uygulamamızın aynı kabul ettiği girişleri aynı biçimde saklamak ve aramak.

Burada önemli bir sınır var: E-posta adreslerinin yerel kısmında büyük/küçük harf davranışı teknik olarak her sistemde aynı değildir. Biz kullanım kolaylığı için e-postanın tamamını küçük harfe dönüştürmeyi **bu uygulamanın hesap politikası** olarak seçiyoruz; bunu bütün e-posta servisleri için evrensel kural olarak sunmuyoruz.

Ayrıca sağlayıcıya özel kurallarla nokta silme veya `+` işaretinden sonrasını atma gibi dönüşümler yapmayacağız. Bunlar farklı e-posta servislerinde farklı sonuçlar doğurabilir.

---

## Düzenlemek Başka, Geçerli Olduğunu Kontrol Etmek Başka

Şu değerin başındaki boşlukları kaldırabiliriz:

```text
"  email-degil  "
```

## Örnek 7

Ama bu işlem onu geçerli bir e-posta adresine dönüştürmez.

İki farklı sorumluluğumuz var:

- **Normalization:** Kabul ettiğimiz adresi ortak biçime getirir.
- **Validation:** Gönderilen değerin beklediğimiz kurallara uyup uymadığını kontrol eder.

Gelen isteği kontrol etmek için **Joi**'yi, veritabanında saklanan belgenin yapısını tanımlamak için **Mongoose**'u kullanacağız.

Bunları henüz yeni bir endpoint açmadan konuşuyoruz; çünkü hesabın nasıl tanımlandığına daha kayıt oluşturulmadan karar vermek istiyoruz.

---

## İki Kişi Aynı E-postayla Kayıt Olursa?

Ada'nın hesabı zaten kayıtlı olsun. Aynı e-posta adresiyle bir kayıt isteği daha geldiğinde bunun ikinci bir hesap oluşturmasını istemiyoruz.

Aksi hâlde giriş sırasında `ada@example.com` hangi hesaba ait olacak?

Bu nedenle e-posta alanı için **benzersizlik (uniqueness)** kuralı koyacağız.

Mongoose ile bir kaydın alanlarını tarif ettiğimiz *Schema* içinde şu tanımla karşılaşacağız:

Bu, henüz yazdığımız bir dosya değil; 5. bölümde oluşturacağımız `src/db/models/user.js` içindeki `email` alanının nasıl tanımlanabileceğini gösteren bir örnek.

```js
email: {
  type: String,
  required: true,
  trim: true,
  lowercase: true,
  unique: true,
}
```

## Örnek 8

`trim` ve `lowercase` seçtiğimiz biçimi destekler. `unique: true` ise MongoDB'de bu alan için benzersiz indeks oluşturulmasını hedefleyen bir Schema tanımıdır.

Önemli ayrım: **`unique: true` tek başına bir Mongoose validation kuralı değildir.** Benzersizliği gerçekten veritabanındaki indeks uygular. İndeks henüz kurulmamışsa veya kurulması mevcut tekrarlı veriler yüzünden başarısız olmuşsa aynı korumanın çalıştığını varsayamayız.

MongoDB'de indeksler aramayı destekleyebildiği gibi benzersizlik kuralını da koruyabilir. Burada indeksi bir **veri kuralını korumak** için kullanıyoruz.

---

## Kayıttan Önce Kontrol Etmek Yeterli Olmaz mı?

Kayıt sırasında önce şu sorguyu yazmak mantıklı görünebilir:

```js
const existingUser = await User.findOne({ email });
```

## Örnek 9

Eğer hesap varsa kullanıcıya anlaşılır bir hata döndürebiliriz.

Fakat iki kayıt isteği neredeyse aynı anda gelirse şöyle bir durum oluşabilir:

```text
İstek A → aynı e-posta var mı? → yok
İstek B → aynı e-posta var mı? → yok
```

## Örnek 10

Her ikisi de hesap oluşturmayı deneyebilir.

İki kişi aynı kapıdan peş peşe geçmiyor; iki istek, birincisi kaydı yazmadan önce aynı boş sonucu görebiliyor. İşte bu yüzden “önce baktık, hesap yoktu” kontrolü yarışan iki istekte yeterli değil.

Bu yüzden `findOne` kontrolü yararlı olsa da **tek güvence değildir**. Benzersiz indeks oluşturulmuşsa MongoDB aynı e-posta değerini taşıyan ikinci kaydı reddeder. Uygulama da ortaya çıkan duplicate key hatasını uygun biçimde ele almalıdır.

Burada yeni bir kavram ezberlemek zorunda değiliz. Sadece şu sonucu görüyoruz: İki isteğin aynı anda gelmesi, yalnızca “önce sorguladım” düşüncesini yetersiz bırakabilir.

---

## Register ve Login Aynı Kararı Vermeli

Ada'nın kaydı şu biçimde saklandıysa:

```text
ada@example.com
```

## Örnek 11

giriş sırasında `ADA@EXAMPLE.COM` yazdığında da aynı hesap aranmalı.

Bu nedenle e-posta normalleştirme kararını yalnızca kayıt sırasında uygulamak yetmez:

```text
register → normalize et → kaydet
login    → normalize et → ara
```

## Örnek 12

Kayıt ve giriş sırasında aynı normalleştirmeyi kullanmak önemlidir: Ada adresini farklı büyük-küçük harflerle yazsa da aynı hesabı bulabilmeliyiz. Böylece adresin yazılış biçimi, uygulamanın farklı noktalarında hesabın kimliğini değiştirmez.

---

## Şimdi User Modeline Hazırız

Başlangıçta karar verdiğimiz üç alanı hatırlayalım:

```text
name
email
passwordHash
```
