# Bölüm 14 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# Giriş Yaptık Ama Sonraki HTTP İsteğinde (Request) Kullanıcıyı Nasıl Hatırlayacağız?

## Ada Giriş Yaptı. Peki Kendi Listesini Açınca Ne Olacak?

Ada e-posta adresini ve parolasını yazıp **Giriş yap** düğmesine basıyor. Movie API, on üçüncü bölümde kurduğumuz `POST /auth/login` yolunda bilgileri denetliyor ve başarılı yanıt veriyor. Ada artık kendi izleme listesini açmak istiyor.

Burada küçük ama önemli bir sorun var: **Giriş isteğinin başarılı olması, Ada'nın bundan sonra göndereceği her istekte tanınacağı anlamına gelmiyor.**

Herkesin erişebildiği film kataloğunu görmek için kullanıcının kim olduğunu bilmek zorunda değiliz. Ancak Ada'nın kişisel listesini göstereceksek isteğin gerçekten onun hesabıyla ilişkili olduğunu anlamamız gerekiyor. Kitabın ilerleyen bölümlerinde bu listeyi oluşturacağız; şimdilik sorunun kendisine odaklanalım.

## Aynı Tarayıcıdan Gelen İki İstek Neden Birbirine Bağlı Değil?

Şu iki ayrı HTTP isteğini düşünelim:

```text
1. Ada → POST /auth/login → 200 OK (giriş başarılı)

2. Ada → kişisel listesini açmak için yeni bir istek → ?
```

## Örnek 2

stateless*) olması**, her isteğin önceki isteğe ait kullanıcı bilgisini kendiliğinden taşımaması demektir. Sunucu elbette veri saklayabilir; durumsuzluk, istekler arasında ilişki kuran bilginin **bizim tarafımızdan tasarlanması gerektiğini** anlatır.

Ada'ya her sayfa değişiminde tekrar parola sormak bir çözüm gibi görünebilir. Fakat hem kullanımı zorlaştırır hem de parolayı gereksiz yere tekrar tekrar taşımamıza yol açar. Parolayı bir kez doğrulayıp sonraki istekler için başka bir yol bulmalıyız.

## Bir Kez Doğrula, Sonraki İsteklerde Oturumu Tanı

Bir sinemanın vestiyerinde montunuzu bıraktığınızı düşünün. Görevli montu alır, size bir fiş verir. Her dönüşünüzde montunuzu yeniden tarif etmezsiniz; fiş, görevlinin doğru kaydı bulmasına yarar.

Biz de benzer bir ayrım kuracağız:

- **Sunucu**, başarılı girişten sonra Ada'nın hesabına bağlı bir **oturum (*session*) kaydı** tutar.
- **Tarayıcı**, o kayda ulaşmayı sağlayan tahmin edilmesi güç bir **oturum kimliğini (*session ID*)** saklar.
- Ada yeni bir istek yaptığında tarayıcı bu kimliği uygun koşullarda sunucuya gönderir. Sunucu kimliğin geçerli bir kayda karşılık gelip gelmediğini kontrol eder.

Akışı iki istek boyunca izleyelim:

```text
İLK İSTEK — GİRİŞ
Ada parolasını gönderir
        ↓
Movie API parolayı doğrular
        ↓
Sunucuda Ada'ya bağlı oturum kaydı oluşur
        ↓
Tarayıcıya bu kaydın kimliği verilir

İKİNCİ İSTEK — KİŞİSEL LİSTE
Tarayıcı oturum kimliğini geri gönderir
        ↓
Sunucu kimliğe karşılık gelen kaydı bulur
        ↓
Kaydın geçerliliğini ve erişim iznini kontrol eder
        ↓
Ada'nın kişisel verisi gösterilebilir
```

## Örnek 3

Burada parolayı ikinci kez göndermedik. Ayrıca tarayıcıya Ada'nın tüm kullanıcı belgesini veya yetkilerini koymadık. **Kimlik, sunucudaki kaydı bulmaya yarıyor; kaydın içeriği sunucunun kontrolünde kalıyor.**

Vestiyer benzetmesinin bir sınırı da var: Fişi ele geçiren kişi montu almaya çalışabilir. Oturum kimliği de ele geçirilirse kötüye kullanılabilir. Bu yüzden kimliğin rastgele üretilmesi, güvenli taşınması ve gerektiğinde geçersiz kılınması şart. Kimliğin varlığı tek başına sınırsız erişim hakkı vermez.

## Tarayıcı Kimliği Her İstekte Nasıl Hatırlayacak?

Geriye bir soru kaldı: Ada'nın kullandığı web sayfası, oturum kimliğini her defasında elle mi gönderecek?

Tarayıcıların bunun için hazır bir mekanizması var: **cookie (çerez)**. Sunucu bir HTTP yanıtıyla çerez oluşturulmasını isteyebilir; tarayıcı da o çerezi, adres ve güvenlik kuralları izin verdiğinde sonraki HTTP isteklerine ekleyebilir.

```text
Cookie  → tarayıcının taşıdığı bilgi (örneğimizde oturum kimliği)
Session → sunucunun yönettiği oturum kaydı
```
