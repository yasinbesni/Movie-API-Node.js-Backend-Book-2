# Bölüm 22 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

kullanılmaya devam etmesi riskidir. `regenerate()` ile yeni kimlik oluşturmak, kullanıcının parolasını yeniden doğrulamakla aynı şey değildir; başarıyla giriş yapıldıktan sonra eski kimlikle yeni yetki arasındaki bağı kesmeye yarar.

## Ada Doğru Parolayı Girdi; Eski Kimlik Ne Olacak?

Movie API artık Ada'yı tanıyor, oturumunu MongoDB'de tutuyor ve çıkış yapınca kapatabiliyor. Fakat giriş sırasında gözden kaçabilecek bir ayrıntı var.

Tarayıcı, Ada giriş yapmadan **önce** bir oturum kimliği edinmiş olabilir. Ada doğru parolayı yazdıktan sonra sunucu bu **aynı** kimliği giriş yapılmış bir oturum için kullanmaya devam ederse, kimliğin daha önceden başka biri tarafından bilinmesi tehlikeli hâle gelir.

Şöyle düşünelim: Saldırganın önceden bildiği bir `sid` değeri, bir biçimde Ada'nın tarayıcısına yerleştirilmiş olsun. Ada doğru parolayla giriş yaptığında uygulama **aynı kimliği** giriş yapılmış oturuma dönüştürürse saldırgan bu kimliği de kullanmayı deneyebilir. Parolayı bilmesine gerek kalmaz.

Buna **session fixation (oturum kimliği sabitleme)** denir. Çözüm, girişten önceki kimliği güvenilir kabul etmemek ve başarılı girişte **yeni, tahmin edilemeyen bir oturum kimliği** vermektir.

```text
Girişten önce:  sid=ESKI  → anonim oturum
Girişten sonra: sid=ESKI  → Ada'nın oturumu   (riskli)

İstediğimiz:
Girişten sonra: sid=YENI  → Ada'nın oturumu
```

## Örnek 2

nceden başka biri tarafından biliniyor olmasın istiyoruz. `regenerate()` tam burada devreye girer: Başarılı giriş **öncesinde** kullanılan kimliği bırakır, Ada'nın doğrulanmış oturumu için **yeni** bir kimlik üretir. Çerezi imzalamak bu değişimin yerini tutmaz; saldırgan önceden geçerli bir kimliği biliyorsa imza kontrolünden geçebilir.

## İlk Oturum Ayarlarımızda Küçük Bir Ayrıntı

On yedinci bölümde `saveUninitialized: false` seçmiştik. Yani yalnızca sayfayı açan her ziyaretçiye otomatik olarak kalıcı bir anonim oturum çerezi verilmez. **Bu nedenle girişten önce mutlaka bir `sid` göreceğinizi varsaymayın.**

Yine de uygulama ileride anonim oturumda tercih veya geçici veri saklayabilir. Oturum kimliğini yenileme önlemi, işte böyle durumlarda önem kazanır. Kodumuzu yalnızca bugünkü en basit senaryoya göre değil, bu geçişi de güvenli yönetecek şekilde düzenleyeceğiz.

## `req.session.regenerate()` ile Kimliği Değiştirelim

`express-session`, başarılı girişte yeni oturum kimliği üretmek için `regenerate()` sağlar. On üçüncü bölümde oluşturduğumuz `src/controllers/auth.js` dosyasındaki **mevcut `loginUser` fonksiyonunu** aşağıdakiyle değiştiriyoruz; ikinci bir login yolu eklemiyoruz.

```js
export const loginUser = async (req, res, next) => {
  const user = await authService.loginUser(req.body);

  req.session.regenerate((error) => {
    if (error) {
      return next(error);
    }

    req.session.userId = user._id.toString();

    req.session.save((saveError) => {
      if (saveError) {
        return next(saveError);
      }

      return res.status(200).json({
        message: "Giriş başarılı.",
        data: toPublicUser(user),
      });
    });
  });
};
```

## Örnek 3

atayı Express'in hata işleme mekanizmasına iletir; başındaki `return` callback'in kalanını çalıştırmaz. Dolayısıyla `userId` atayıp giriş başarılı yanıtı göndermeyiz.
- **Yenileme başarılı:** `error` yoktur ve `if` bloğu atlanır. Artık **yeni oturuma** `req.session.userId` yazılır. Sonra `req.session.save()` bu bilgiyi kaydeder. Onun callback'indeki `saveError` da aynı mantıkla, bu kez **kaydetme işleminin** sonucunu bildirir.

**Neden yanıtı hemen göndermiyoruz?** Kayıt sırasında hata oluşursa kullanıcıya giriş başarılı dediğimiz hâlde sunucu sonraki istekte oturumu bulamayabilir. Başarı yanıtını oturumun kaydedilmesine bağlıyoruz.

Bu kodu çalıştırabilmek için on yedinci bölümden beri `session` middleware'inin `/auth` Router'ından **önce** çalışıyor olması gerekiyor. `toPublicUser()` da on üçüncü bölümdeki mevcut yardımcı fonksiyonumuz; kullanıcı belgesini olduğu gibi yanıtlamıyoruz.

`regenerate()` kimlik yenilemesini yapar; fakat ağ bağlantısını, çerez ayarlarını veya diğer güvenlik önlemlerini gereksiz kılmaz.

## Eski ve Yeni Kimliği Denemek

Yalnızca yerel test ortamında eski bir anonim oturum oluşturmak isterseniz, `src/server.js` içinde geçici olarak şu yolu açabilirsiniz:

```js
app.get("/debug/anonymous-session", (req, res) => {
  req.session.visitedBeforeLogin = true;
  return res.status(200).json({ message: "Hazır." });
});
```
