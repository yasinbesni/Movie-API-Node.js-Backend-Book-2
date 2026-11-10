# Bölüm 59 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

görmek, yarın da aynı davranışın korunacağını kanıtlamaz.** Kimlik doğrulama ve yetki sınırlarını tekrar tekrar sınayacak otomatik testleri planlayacağız.

## Dosya Yüklemeyi Geliştirirken Giriş Neden Bozulabilir?

Ada’nın hesabını oluşturduk, giriş işlemini kurduk ve yetkilerini denetledik. Şimdi giriş ara katmanındaki çerez adını değiştirdiğimizi düşünelim. Ada dün hesabına ulaşabiliyorken bugün aynı isteği gönderdiğinde giriş yapılmamış gibi görünebilir. Üstelik bu değişiklik, başka bir kullanıcının verisine erişimi engelleyen denetimleri de etkileyebilir.

Daha önce çalışan bir özelliğin yeni değişiklikten sonra bozulmasına **gerileme (regresyon)** denir. Bu tür sorunları her güncellemede tek tek Postman'de aramak zorlaşır. Daha kötüsü, atladığımız test tam da başka bir kullanıcının kaydına erişilmesini engelleyen kontrol olabilir. **Bir kere denemekle her değişiklikten sonra güvenmek** arasındaki farkı burada çözmeye başlayacağız.

Postman ile istekleri tek tek denemek hâlâ yararlı; gelen yanıtı doğrudan görebiliyoruz. Fakat `authenticate` ara katmanında küçük bir değişiklik yaptığımızda yalnız başarılı girişi değil, reddedilmesi gereken durumları da yeniden sınamamız gerekir:

```text
access token yok
access token expired
access token invalid
User silinmiş
User inactive
authVersion değişmiş
normal user admin route'a gidiyor
owner başka kullanıcı
```

## Örnek 2

Bir senaryoyu unutmak çok kolaydır.

---

## Authentication Kodu Özellikle Regresyona Hassastır

Auth kodu birçok route'un önünde çalışır.

Tek değişiklik geniş etki oluşturabilir:

```text
cookie adı değişti
↓
her protected route 401
```

## Örnek 3

veya:

```text
role kontrolünde hata
↓
normal user admin işlemi yapabiliyor
```

## Örnek 4

çmayı sınayan otomatik test, yeni yükleme kodunun eski bir davranışı bozduğunu gösterebilir. Bu yüzden yalnız yeni özellik için değil, **ondan etkilenebilecek eski davranış için de** test yazıyoruz.

Testin beklediği sonucu önceden belirleriz: “Ada doğru parolayla giriş yaptıktan sonra kendi hesabını görür” ve “Deniz, Ada'nın kaydını değiştiremez.” Daha sonra testi çalıştırır, beklenen ile elde edilen sonucu karşılaştırırız. Böylece yalnız `200` yanıtını değil, yanlışlıkla değişen kullanıcı kimliği veya kayıt gibi **sonucun içeriğini** de kontrol ederiz.

## Otomatik Test Neyi Kanıtlar?

Örneğin “doğru parola ile giriş `200` döndürdü” testi, Ada'nın sonraki istekte hâlâ tanındığını **kanıtlamaz**. Bunun için aynı tarayıcının çerezini taşıyan ikinci isteği de sınamalıyız. Bu nedenle testleri yalnız tek fonksiyonun sonucuna değil, kullanıcı davranışının parçalarına da göre tasarlayacağız.

Otomatik test **bütün güvenlik açıklarının bulunacağını garanti etmez**; yalnız yazdığımız senaryoları tekrar çalıştırır. Yine de Ada'nın girişinin yanlışlıkla bozulup bozulmadığını ya da Deniz'in erişmemesi gereken bir kayda erişip erişemediğini her değişiklikten sonra denememizi sağlar.

Örneğin:

```text
"aynı email ikinci kez register olamaz"
```

## Örnek 5

bir test hâline gelirse gelecekte service refactor edildiğinde otomatik olarak tekrar doğrulanır.

---

Bir test “normal kullanıcı `/admin` yoluna giremez” beklentisini doğrulayabilir. Ama hiç yazılmamış bir kontrolü test paketi kendi kendine keşfetmez. Bu nedenle güvenlik kurallarını önce **başarılı olmalı / reddedilmeli** örnekleriyle somutlaştırıp her kural için test düşünmeliyiz. Otomatik test güvenliği garanti eden sihirli bir onay değil, açıkça yazdığımız beklentilerin tekrar kontrolüdür.

## Test Piramidini Basit Tutalım

Authentication kodunu üç test seviyesinde ele alabiliriz:

```text
unit test
→ küçük fonksiyon

integration test
→ Express + middleware + database

end-to-end
→ gerçek deployment + frontend + dış servisler
```

## Örnek 6

Authentication için özellikle integration test değerlidir.

Çünkü problem yalnızca `verifyPassword()` fonksiyonunda değildir; cookie, router, middleware, DB ve response birlikte çalışır.

---

Ada giriş yaptığında yalnız başarılı sonucu test edersek önemli bir hatayı kaçırabiliriz. Örneğin yanlış parola için `401` döndüğünü, çıkıştan sonra yenileme belirtecinin kullanılamadığını ve Deniz'in Ada'nın kişisel kaydını değiştiremediğini de sınamalıyız. **Güvenlikte bazen en değerli test, yapılmaması gereken şeyin gerçekten yapılamadığını göstermektir.**

Postman'de bir kez doğru çalıştırdığımız işlem, daha sonra başka bir dosyada yapılan değişiklikten etkilenebilir. Otomatik test bu kritik beklentileri yeniden ve aynı biçimde kontrol etmemize yardım eder; ancak yalnız yazdığımız senaryoları kontrol eder, aklımıza gelmeyen her hatayı bulacağını garanti etmez.

## Hangi Senaryolar Öncelikli?

İlk otomasyon listemiz:

```text
register 201
invalid register 400
duplicate email 409
login 200
wrong password 401
protected route without auth 401
normal user admin route 403
owner kendi resource'unu update eder
başka owner update edemez
refresh rotation çalışır
logout sonrası refresh yapılamaz
password reset eski oturumları invalid eder
```

## Örnek 7

Bu liste, API’nin kullanıcıya vaat ettiği davranışların **hangi testlerle kontrol edileceğini** gösterir.

---

Bir test yalnız kodu denemek için Ada adına `ada@example.test` hesabı oluşturabilir. Başka test aynı e-posta ile hesap açmaya kalkarsa `409` alır ve davranış testi gerçek bir hata olmadan başarısız görünür. Bu nedenle her test kendi başlangıç verisini hazırlamalı, neyi değiştirdiğini bilmeli ve sonunda güvenle temizlemelidir. Ayrı test veritabanının nasıl korunacağını 64. bölümde uygulayacağız.

## Test Verisi İzole Olmalı

Aynı database üzerinde testleri tekrar tekrar çalıştırırsak önceki run'dan kalan User yeni testi bozabilir.

Bu yüzden testler:

```text
kendi test database'i
+
kontrollü setup/cleanup
```

## Örnek 8

kullanmalıdır.

Bu yüzden **test veritabanı bağlantısı** ve test kayıtlarını temizleme işlemleri gerçek kullanıcıların bulunduğu canlı ortamdan kesin biçimde ayrılmalıdır.

---

## Email ve Storage Gibi Dış Bağımlılıklar

Test sırasında gerçek kullanıcıya email göndermek istemeyiz.

Object storage'a gerçek dosya yüklemek de her testte gerekli değildir.

Test sırasında e-posta hizmeti yerine mesajları yalnız bellekte toplayan **taklit bir servis** (*mock/fake*) kullanabiliriz. Böylece “Ada’ya e-posta gönderme işlevi çağrıldı mı?” sorusunu gerçek kişiye mesaj göndermeden yanıtlarız. Ancak bu test, gerçek e-posta sağlayıcısının çalıştığını kanıtlamaz.

Katmanları ayırmış olmamız burada işe yarar:

```text
sendEmail()
saveAvatar()
```
