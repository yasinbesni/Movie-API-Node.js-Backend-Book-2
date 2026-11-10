# Bölüm 3 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# User Document İçinde Hangi Veriler Gerçekten Bulunmalı?

## Film Bilgilerini Biliyoruz. Peki Bir Hesabı Ne Tanımlar?

Movie API'de bir film kaydının adı, yayın yılı ve puanı gibi alanları var. Bunların hangi bilgileri temsil edeceğine, uygulamanın ihtiyacına göre karar verilmişti.

Şimdi Ada için bir hesap açacağız.

Film listesini daha sonra Ada'ya bağlayabilmek istiyoruz. Bunun için veritabanında Ada'yı temsil eden kalıcı bir kayıt bulunmalı. Fakat bu kayda neleri yazacağız?

İlk akla gelenler çoğalabilir:

```text
ad
email
parola
profil fotoğrafı
telefon
rol
son giriş tarihi
kişisel film listesi
```

## Örnek 2

Hepsini aynı anda eklersek çalışacak bir model yazmış olabiliriz. Ama henüz gerekmediği hâlde çok sayıda sorumluluğu da bu kayda yüklemiş oluruz.

Şimdiki işimiz çok daha küçük: **Ada için bir hesap oluşturabilmek.**

---

## Kayıt Formundaki Üç Bilgi

Hesap açmak isteyen Ada'dan başlangıçta üç alan isteyelim:

```json
{
  "name": "Ada",
  "email": "ada@example.com",
  "password": "Ornek-Uzun-Bir-Parola"
}
```

## Örnek 3

Bu değerler henüz API'mize gönderilmiş değil; ileride kuracağımız kayıt isteğinin örneği.

- `name`: Ada'ya uygulama içinde nasıl hitap edeceğimizi belirler.
- `email`: Giriş yapmak için kullanacağımız hesap tanımlayıcısıdır.
- `password`: Ada'nın hesap girişinde sunacağı gizli bilgidir.

İlk iki alanı kaydetmek anlaşılır görünüyor. Ama üçüncüsü için durmamız gerekiyor.

---

## Gönderilen Parola, Saklanan Parola Olmamalı

Bir MongoDB belgesine doğrudan şunu yazmak kolay olurdu:

```json
{
  "name": "Ada",
  "email": "ada@example.com",
  "password": "Ornek-Uzun-Bir-Parola"
}
```

## Örnek 4

Ancak bu doğru bir kayıt tasarımı değildir. Veritabanına erişen biri, Ada'nın düz metin parolasını da görür.

Hesap verisini tasarlarken şu ayrımı yapacağız:

```text
Kayıt isteğindeki veri         Veritabanında saklanan veri
---------------------------    ---------------------------
name                           name
email                          email
password                       passwordHash
```

## Örnek 5

`passwordHash`, Ada'nın parolası değil, parola doğrulamasında kullanılacak **hash değeridir**. Bu değerden yola çıkarak eski parolayı doğrudan geri elde edemeyiz. Ada giriş yaptığında gönderdiği parolayı, saklanan hash'e karşı doğrulayacağız; **ham parolayı kalıcı `User` belgesine yazmayacağız.** 8. bölümde bunun neden şifrelemeyle aynı işlem olmadığını göreceğiz.

İstemcinin gönderdiği bilgilerle (**Request Body**) veritabanında sakladığımız bilgilerin birebir aynı olması gerekmiyor. Burada bu fark, güvenlik açısından zorunlu hâle geliyor.

---

## User Kaydının İlk Hâli

Veritabanındaki hesabımız kabaca şöyle görünecek:

```json
{
  "_id": "...",
  "name": "Ada",
  "email": "ada@example.com",
  "passwordHash": "<parola hash değeri>",
  "createdAt": "...",
  "updatedAt": "..."
}
```

## Örnek 6

Buradaki `passwordHash` değeri açıklama amaçlı bir yer tutucudur; bu metni gerçek parola hash'i olarak veritabanına yazmayacağız.

MongoDB her kayda bir `_id` alanı verir. Oluşturulma ve güncellenme tarihlerini (`createdAt` ve `updatedAt`) de Mongoose'un `timestamps` özelliğiyle tutabiliriz.

Burada `_id` ile `email` aynı görevi üstlenmez. Ada e-posta adresini ileride değiştirebilir; `_id` ise veritabanındaki o hesabı diğerlerinden ayıran kalıcı tanımlayıcı olarak kalır. Böylece kişisel film listesini yalnızca değişebilen e-posta metnine bağlamak zorunda kalmayız.

Bu kayıt şimdilik Ada'nın hesabını temsil etmek için yeterli.

---

## Peki Kullanıcının Rolü ve Film Listesi?

İleride bazı kişiler yalnızca film izleyecek, bazıları uygulamanın içerik yönetiminde görev alabilecek. Bu durumda `role` gibi bir alana ihtiyaç duyabiliriz.

Ada'nın kişisel film listesi de bir yerde saklanacak. Ancak henüz listenin veritabanında nasıl tutulacağına karar vermedik. Onu doğrudan User belgesine doldurmak zorunda değiliz.

Şimdiden bütün seçenekleri modele yerleştirmek yerine şu anki ihtiyacı çözüyoruz:

```text
İlk hedef: hesap açabilmek
     ↓
Gerekli: ad + e-posta + güvenli parola doğrulama verisi
     ↓
Henüz gerekli değil: roller, film listeleri, oturum kayıtları
```

## Örnek 7

Hesap açma işlemi için gerekmeyen bu alanları eklememek, `User` modelini daha anlaşılır tutuyor. Film listesi, rol ve oturum verilerinin her biri kendi erişim ve saklama kurallarına sahip olacak.

Örneğin bir kullanıcı iki cihazdan giriş yapabilir. Bir cihazdaki oturumu kapatmak için kullanıcı belgesinin bütün yapısını yeniden yazmak istemeyiz. Oturum kayıtlarının nerede tutulacağını oturum bölümüne geldiğimizde ele alacağız.

---

## Veritabanındaki Bilgilerin Hepsi Response'a Gitmez

Kullanıcı hesabını oluşturduğumuzda client'a bir cevap döndüreceğiz. Ama User belgesindeki her alan bu cevabın parçası olmak zorunda değil.

Örneğin Ada'ya şöyle bir sonuç gösterebiliriz:

```json
{
  "data": {
    "name": "Ada",
    "email": "ada@example.com"
  }
}
```

## Örnek 8

Buna karşılık şu alanı **göndermeyeceğiz**:

```text
passwordHash
```

## Örnek 9

Hash değeri düz metin parola olmasa da hassas bir bilgidir. Client'ın bunu bilmesi gerekmiyor.

API'nin dışarı gönderdiği cevap (**Response**), veritabanı kaydının aynısı olmak zorunda değil. **Veritabanında saklanması gereken bilgiyle kullanıcıya gösterilmesi gereken bilgi farklı olabilir.**

---

## Model Yazmadan Önce Son Karar

Ada için ilk kalıcı hesap alanlarımız belli:

```text
User
├── name
├── email
├── passwordHash
├── createdAt
└── updatedAt
```
