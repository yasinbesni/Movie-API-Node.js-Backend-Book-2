# Bölüm 18 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

esine Giriyor, Ama Oturumu Yok

Dün Ada'nın girişi çalışıyordu. Cookie tarayıcıdaydı ve Movie API aynı oturumu tanıyordu. Bugün uygulamayı yeniden başlatıp aynı isteği gönderiyoruz. Cookie yine geliyor; fakat sunucu Ada'yı artık tanımıyor.

Ada çerezini kaybetmiş değil. Asıl fark, **tarayıcının elindeki oturum kimliğinin sunucuda artık karşılığının bulunmaması**. Bir anahtarın cebimizde durması, açacağı kilidin hâlâ yerinde olduğu anlamına gelmez; burada anahtar `sid`, karşılığıysa oturum kaydıdır.

`store` ayarını henüz belirtmediğimiz için `express-session`, varsayılan **`MemoryStore`** yöntemini seçti. Adındaki `Memory`, **Node.js uygulamasının RAM belleğini** anlatır. `Store` ise oturum kayıtlarını saklayan mekanizmadır. Yani `MemoryStore`, Ada'nın hesabını sakladığımız `users` koleksiyonu veya yeni kurduğumuz bir veritabanı değildir; girişten sonra oluşan **geçici oturum kayıtlarını Node.js çalıştığı sürece** tutar.

Ada giriş yaptığında iki şey ayrı yerlerde durur: Tarayıcı `sid` çerezini saklar; `MemoryStore` ise bu kimliğin karşısında Ada'nın `userId` bilgisini taşıyan oturum kaydını tutar. Node.js kapandığında ikincisi kaybolur; tarayıcıdaki çerez bundan haberdar değildir.

```text
Node.js çalışırken:
  sid=A1 → Ada

Node.js yeniden başladığında:
  bellek boş
  sid=A1 → kayıt bulunamadı
```

## Örnek 2

Tarayıcının sakladığı kimlik, sunucuda karşılığı kalmadığında kullanıcıyı tanımamıza yetmez.

Bu iki parçayı elle sınamak için Ada'yla giriş yaptıktan sonra çerezi silmeden yalnız Node.js uygulamasını kapatıp yeniden başlatabiliriz. Aynı çerez gönderildiği hâlde test yolunda `userId` artık bulunmuyorsa sorun giriş parolasının doğrulanmasında değil, oturum kaydının kalıcılığındadır.

## Bir Sunucu Daha Eklersek?

Movie API daha fazla istek almaya başlasın ve iki sunucu kopyasıyla çalışsın. Ada ilk isteğinde A sunucusuna ulaşıyor; oturum yalnızca onun belleğinde oluşuyor. İkinci istek B sunucusuna gittiğinde B'nin aynı kaydı bulmasını bekleyemeyiz.

```text
İlk istek:     Ada → Sunucu A → oturum var
Sonraki istek: Ada → Sunucu B → oturum yok
```
