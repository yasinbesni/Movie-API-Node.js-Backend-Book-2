# Bölüm 2 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# Kimlik, Authentication, Session ve Authorization Aynı Şey Değildir

## Ada'nın Listesi Neden Deniz'e Açılmamalı?

Ada, izlemek istediği filmleri kendi listesine kaydetmek istiyor. Önce uygulamada bir hesap oluşturduğunu düşünelim.

Ertesi gün geri geldiğinde *Interstellar*'ın hâlâ kendi listesinde olmasını bekler. Deniz ise kendi hesabıyla giriş yaptığında Ada'nın listesine ulaşmamalı.

Kulağa tek bir iş gibi geliyor: “Giriş yapmayı ekleyelim.”

Ama iki kişinin listelerini birbirinden ayırabilmek için farklı anlarda farklı sorular sormamız gerekiyor.

İlk sorudan başlayalım.

---

## 1. Hesabı Söylemek, Hesabın Sahibi Olmak Değildir

Ada giriş formuna şu bilgileri yazıyor:

```json
{
  "email": "ada@example.com",
  "password": "..."
}
```

## Örnek 2

E-posta adresi, **hangi hesaba giriş yapılmak istendiğini** söylüyor.

Burada önemli bir fark var: Birisi form alanına `ada@example.com` yazabiliyorsa bu, hesabın sahibi olduğu anlamına gelmez. Herkes başkasının e-posta adresini bilebilir.

Bu, yalnızca bir **kimlik iddiasıdır**: formu gönderen kişi Ada'nın hesabını kullanmak istediğini söylüyor; sistem henüz buna inanmak için bir neden görmedi.

```text
"Ada'nın hesabına giriş yapmak istiyorum."
```

## Örnek 3

Henüz giriş başarılı değil.

---

## 2. Authentication: İddianın Doğrulanması

Şimdi uygulama gönderilen parolayı denetlemeli.

Backend, gelen parolayı veritabanında saklanan düz metin bir parolayla karşılaştırmaz. Kayıt sırasında paroladan **hash** adı verilen, doğrulamada kullanılacak bir değer üretilir ve saklanır. Bu, parolanın kısaltılmış hâli değildir; parolayı veritabanından geri okumadan, Ada'nın girdiği parolanın doğru olup olmadığını kontrol etmemizi sağlar. Hashleme yöntemini ve parola doğrulama kodunu 8. ve 9. bölümlerde kuracağız.

Karar sırası şöyle:

```text
Hesap bulundu
      ↓
Parola doğrulandı mı?
      ├── Hayır → giriş reddedilir
      └── Evet → hesap doğrulandı
```

## Örnek 4

Bu adıma **authentication (kimlik doğrulama)** diyoruz.

Bir hesapta doğru parolanın kullanılabilmesi, sistemin o hesabın giriş bilgisini başarıyla doğruladığını gösterir. Gerçek kişinin kimliğini veya e-posta adresinin sahibi olduğunu tek başına kesin olarak kanıtlamaz; bu ayrımı özellikle koruyacağız.

Artık uygulama giriş için sunulan bilgilerin Ada'nın hesabıyla eşleştiğini biliyor.

Ama Ada'nın işi henüz bitmedi.

---

## 3. Sonraki İstekte Ada'yı Nasıl Tanıyacağız?

Giriş başarılı oldu. Ada şimdi kendi listesini açıyor:

```http
GET /watchlist
```

## Örnek 5

*`GET /watchlist`, Ada’nın kişisel listesine ulaşmak için kullanılabilecek örnek bir adrestir. Burada çalışan bir HTTP yolu kurmuyoruz. 53–54. bölümlerde izleme listesinin veritabanı modelini ve kayıt kurallarını hazırlayacağız; Router ve Controller bağlantısı ayrı bir uygulama adımı olacaktır.*

HTTP'de her yeni istek kendi başına gelir. Bir önceki istekte parolanın doğrulanmış olması, sunucunun sonraki isteği kendiliğinden Ada'ya bağlaması anlamına gelmez.

Her liste görüntülemede parolayı yeniden göndermek de istemeyiz.

O hâlde başarılı girişten sonra sunucunun anlayabileceği bir **oturum sürekliliği** kurmamız gerekir.

Bu sürekliliği sağlamak için farklı yöntemler vardır. Örneğin sunucunun oturum kaydı tutması ve tarayıcının bu oturuma ait tanımlayıcıyı taşıması mümkündür. Başka sistemler imzalı token'lardan yararlanır.

İki yaklaşımda da amaç aynıdır: Her istekte parolayı yeniden istemeden, isteği doğrulanmış hesapla güvenli biçimde ilişkilendirmek.

Buradaki ihtiyaç şudur:

```text
Giriş başarılı
      ↓
Yeni bir istek geldi
      ↓
Bu istek doğrulanmış hangi hesaba bağlı?
```

## Örnek 6

İlk çözümümüzde sunucu Ada'nın girişini bir **oturum kaydında (session)** hatırlayacak. Daha sonra aynı sorunu **JWT adlı imzalı bir belirteçle** çözmenin nasıl farklılaştığını göreceğiz. Hangisinin uygun olduğu, uygulamanın ihtiyaçlarına bağlı.

---

## 4. Authorization: Hesap Tanındıktan Sonraki Karar

İleride kişisel film listelerini oluşturduğumuzda Ada kendi hesabıyla giriş yapıp *Interstellar*'ı görmek isteyecek. Fakat Deniz, Ada'nın listesine ait bir adresi öğrenirse ne olacak?

```text
İsteği gönderen: Deniz
İstenen veri: Ada'nın kişisel listesi
```

## Örnek 7

Deniz'in kendi hesabına başarıyla giriş yapmış olması, Ada'nın verisine erişebileceği anlamına gelmez.

Burada ikinci bir denetim gerekir: **authorization (yetkilendirme).**

```text
Authentication → Hangi hesapla işlem yapılıyor?
Authorization  → Bu hesap bu işlemi yapabilir mi?
```

## Örnek 8

Yalnızca admin gibi özel rolleri denetlemekten söz etmiyoruz. Bir kaydın **kime ait olduğu** da erişim kararının parçası olabilir.

Örneğin:

```text
Ada → kendi listesi    → erişebilir
Deniz → Ada'nın listesi → erişemez
```
