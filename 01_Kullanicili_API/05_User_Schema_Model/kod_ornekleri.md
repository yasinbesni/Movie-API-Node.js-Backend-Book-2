# Bölüm 5 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# İlk User Schema ve Modelimizi Nasıl Kurarız?

## Yeni Bir Model, Tanıdık Bir Yer

Movie API film kayıtlarını Mongoose ile yönetiyor. Film bilgileri için kullanılan yapının yanına şimdi Ada'nın hesabını temsil edecek `User` modelini ekleyeceğiz.

Artık kullanıcı kaydında hangi alanların bulunacağını ve e-posta adreslerinin nasıl karşılaştırılacağını biliyoruz. Bunları Mongoose modeline dönüştürebiliriz.

Elimizdeki kararlar artık yeterince açık:

```text
User
├── name
├── email
├── passwordHash
├── createdAt
└── updatedAt
```

## Örnek 2

E-posta adresi uygulamanın seçtiği ortak biçimde saklanacak. Aynı e-posta ile ikinci bir hesap oluşmasını veritabanındaki benzersiz indeks engelleyecek. Parolanın kendisi ise kaydedilmeyecek.

Mongoose'ta **Schema**, bir kaydın hangi alanlardan oluştuğunu tarif eder; **Model**, bu kayıtlar üzerinde işlem yapmamızı sağlar. Şimdi verdiğimiz kararları Schema'ya yazabiliriz.

---

## User Dosyasını Nereye Koyalım?

Movie API'nin mevcut klasör yapısını koruyacağız. `Movie` modelimiz şu konumda:

```text
src/db/models/movie.js
```

## Örnek 3

Yeni bir klasör mimarisi icat etmek yerine yanına şu dosyayı ekleyelim:

```text
src/db/models/user.js
```

## Örnek 4

Şimdi bu dosyanın içeriğini birlikte oluşturalım.

---

## İlk Alan: Kullanıcının Adı

```js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 80,
  },
});
```

## Örnek 5

Bu alanın görevi basit: Uygulamada Ada'ya bir adla hitap edebilmek.

`required`, `trim`, `minlength` ve `maxlength` özellikleri bize yabancı değil. Son iki sınır, kayıt isteği için bir sonraki bölümde belirleyeceğimiz kuralla da uyumlu olacak.

Bir alan ekledik. Şimdi hesabı tanımamızı sağlayan alanı ekleyelim.

---

## İkinci Alan: E-posta

```js
email: {
  type: String,
  required: true,
  trim: true,
  lowercase: true,
  unique: true,
},
```

## Örnek 6

Bu kod, kullanıcı verisi için belirlediğimiz kuralları tek yerde topluyor.

- `required`: Hesap için e-posta zorunlu.
- `trim` ve `lowercase`: Giriş ve kayıt işlemlerinde kullanacağımız ortak biçimi destekliyor.
- `unique`: MongoDB tarafında benzersiz indeks tanımlanmasını istiyor.

`unique` tek başına bir Joi doğrulaması değildir: Aynı e-posta için iki kayıt yapılmaya çalışılırsa, benzersiz indeks devredeyse MongoDB ikinci kaydı reddeder. Bu hatanın uygulama tarafından anlaşılır bir HTTP yanıtına çevrilmesi de gerekir. Ayrıca indeksin gerçekten oluşturulduğunu kontrol etmeliyiz.

---

## Üçüncü Alan: Neden `password` Değil `passwordHash`?

```js
passwordHash: {
  type: String,
  required: true,
  select: false,
},
```

## Örnek 7

Bu alandaki `select: false` seçimi bir güvenlik varsayılanıdır: Ada'nın profilini okurken parola hash'ini istemiyoruz. Parola doğrulaması yapacağımız özel sorguda ise alanı açıkça isteyeceğiz.

Normal bir kullanıcı sorgusunda şu kodu düşünelim:

```js
const user = await User.findById(userId);
```

## Örnek 8

Bu sorgunun sonucunda parola hash'inin varsayılan olarak seçilmemesini istiyoruz. Çünkü kullanıcı profilini gösterirken hash değerine ihtiyacımız yok.

`select: false` bu güvenli varsayımı sağlamaya yardımcı olur.

Fakat **tek başına hash değerinin asla dışarı sızmayacağını garanti etmez**. Kodun başka bir yerinde alan özellikle seçilebilir veya eldeki nesne yanlışlıkla Response'a aktarılabilir. Bu nedenle Response üretirken yalnızca göndermek istediğimiz alanları açıkça seçeceğiz.

Login sırasında hash değerine ihtiyaç duyulduğunda ise sorgu bu alanı özellikle isteyebilir:

```js
const user = await User.findOne({ email }).select("+passwordHash");
```

## Örnek 9

Böylece aynı kullanıcı kaydından iki farklı amaçla veri okuyabiliyoruz: profil için genel alanlar, giriş doğrulaması için gerektiğinde hash. Alanı dışarıya göndermemek ise ayrıca Controller'ın sorumluluğunda kalacak.

---

## Oluşturulma ve Güncellenme Tarihleri

Film kayıtlarında olduğu gibi Mongoose'un `timestamps` özelliğini kullanacağız:

```js
{
  timestamps: true,
}
```

## Örnek 10

Bu seçenek sayesinde `createdAt` ve `updatedAt` alanlarını elle üretmemiz gerekmeyecek.

Mevcut Movie API'nin varsayılan Mongoose davranışıyla uyumlu kalmak için bu aşamada `versionKey` ayarını değiştirmiyoruz. Mongoose'un `__v` alanı oluşturulabilir; onu kullanıcıya göstereceğimiz Response'un parçası yapmak zorunda değiliz.

---

## Dosyamızın Tam Hâli

`src/db/models/user.js`:

```js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

export const User =
  mongoose.models.User || mongoose.model("User", userSchema);
```

## Örnek 11

Son iki satırdaki `mongoose.models.User` kontrolü, aynı modelin geliştirme sırasında yeniden tanımlanmasını önlemek için kullandığımız bir korumadır. Mevcut `Movie` modelinde de aynı yaklaşım bulunuyor.

Model artık tanımlandı. Ama onu doğrudan kayıt oluşturmak için kullanmaya hazır değiliz.

---

## Henüz User Oluşturmayacağız

Schema'nın `passwordHash` için `String` istemesi, gönderdiğimiz herhangi bir metnin güvenli parola hash'i olduğu anlamına gelmez. Bu yüzden **bu bölümde `User.create(...)` çalıştırmayacağız**. Gerçek bir kayıt oluşturmak için önce güvenli parola hashleme adımını tamamlamamız gerekiyor.

Parolayı nasıl dönüştüreceğimizi henüz öğrenmedik. Ham parolayı alıp doğru yöntemle hash'lemek kayıt işleminin sorumluluğu olacak; veritabanı modeline düz metin parola yazmayacağız.

Yani bu bölümün sonunda tamamladığımız şey:

```text
User belgesinin yapısı → hazır
Güvenli kayıt endpoint'i → henüz yok
```

## Örnek 12

Bu, çalışan projede bilinçli bir ara aşama.

---

## Projede Şimdi Ne Değişti?

Mevcut projede `src/db/models/movie.js` dosyamız var. Şimdi ona bir dosya daha eklendi:

```text
src/
└── db/
    └── models/
        ├── director.js
        ├── movie.js
        └── user.js
```
