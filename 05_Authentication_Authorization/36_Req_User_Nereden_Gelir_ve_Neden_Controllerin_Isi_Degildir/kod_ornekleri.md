# Bölüm 36 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# `req.user` Nereden Gelir? Kimlik Kontrolü Neden Controller'ın İşi Değildir?


## `req.user` İsteğe Hangi Aşamada Ekleniyor?

Kimlik doğrulama ara katmanını oluşturduk; artık Ada'nın kullanıcı kaydını Controller'da yeniden aramak zorunda değiliz. Ancak `req.user`, tarayıcının bize hazır gönderdiği bir bilgi değil. **Middleware token'ı doğrulayıp sunucuda güvenilir kullanıcı bağlamını oluşturduğunda** bu alan kullanılabilir hâle gelir. Böylece Controller kendi görevine odaklanır ve istemcinin gönderdiği rastgele bir `userId` değerine güvenmez.

## Ada'nın İsteğini Kim Tanıdı?

Ada giriş yaptıktan sonra kendi hesap bilgilerini görmek istiyor. `GET /users/me` isteği geçerli erişim çereziyle geldiğinde adını ve e-posta adresini alabiliyor.

Ama `getCurrentUser` Controller'ına tekrar bakalım:

Bu örnek, 35. bölümde oluşturduğumuz `src/controllers/users.js` dosyasındaki `getCurrentUser` fonksiyonunu gösterir; yeniden yazılması gerekmiyor.

```js
export const getCurrentUser = (req, res) => {
  res.status(200).json({ data: toPublicUser(req.user) });
};
```

## Örnek 2

Bu kodda parola kontrolü yok. JWT'yi (JSON Web Token) çözen bir satır da yok. Buna rağmen `req.user` içinde Ada'nın hesabı bulunuyor. **O bilgi oraya nasıl geldi?**

## Aynı İstek, Birkaç Sorumluluk

Aynı HTTP isteğinde çalışan `authenticate` ara katmanı, erişim belirtecini doğrulayıp kullanıcıyı veritabanında bulduktan sonra bilgiyi `req` üzerinde şu satırla erişilebilir kılar:

```js
req.user = user;
```

## Örnek 3

Sonraki Controller, bu isteğe eklenmiş kullanıcıyı okuyor:

```text
GET /users/me
      ↓
authenticate — kimlik doğrulama
      ↓
req.user = Ada'nın kullanıcı kaydı
      ↓
getCurrentUser — yanıtı hazırlama
```

## Örnek 4

CurrentUser` önce çalışsaydı `req.user` henüz oluşmamış olurdu.

İstemci kendi isteğine `userId: 'deniz-id'` eklediğinde `req.user` alanının Deniz'e dönüşmeyeceğini düşünelim. Çünkü `req.user`, istek gövdesindeki bir alan değil, sunucunun **doğruladığı kimlikten** ürettiği bağlamdır. Controller bu alanı kullanarak Ada'nın profilini döndürür; istemcinin yazdığı kimlik bilgisini güvenilir kabul etmez. Aynı nedenle istek gövdesini doğrudan `req.user` nesnesine kopyalamak da güven sınırını bozar.

## Controller'ın Yapması Gereken İş

İki farklı yaklaşımı karşılaştıralım. İlkinde Controller her defasında çerezi okur, belirteci doğrular ve kullanıcıyı arar. İkincisinde kimlik doğrulaması `authenticate` tarafından bir kez yapılır; Controller yalnızca ihtiyaç duyduğu kullanıcı bilgisini kullanır.

Movie API'de ikinci yaklaşımı seçtik. Router, Controller ve Service sorumluluklarını ayrı tutmamızın amacı da bu: **Bir işin kodu değiştiğinde ilgisiz katmanları yeniden düzenlemek zorunda kalmamak.**

Korumalı yolumuzun sırası açıkça görülebilir:

Bu Route, mevcut `src/routers/users.js` dosyasındadır. Burada yeni bir Router oluşturmuyor, kimlik denetiminden sonra Controller’a geçişi inceliyoruz.

```js
router.get("/me", authenticate, getCurrentUser);
```

## Örnek 5

Buradaki `getCurrentUser` yalnızca kimliği doğrulanmış isteklerde çalışmalıdır. Aynı Controller'ı başka bir yola bağlarsak korumayı orada da unutmamalıyız; `req.user` alanının varlığı tek başına bütün yolların güvenli olduğunu garanti etmez.

Ada'nın `GET /users/me` isteği geldiğinde `authenticate` kullanıcı kaydını **yalnız bu isteğe ait** `req.user` alanına koyar. Deniz aynı yolu çağırırsa onun isteğinin `req.user` alanı başka bir kullanıcıyı gösterir. Bu bilgiyi uygulama genelinde ortak bir değişkende tutmadığımız için iki kullanıcının istekleri birbirine karışmaz.

Fakat `req.user` bulunması, içindeki her alanın tarayıcıya gönderilmesini haklı çıkarmaz. `passwordHash` alanını normal sorgulardan gizlemek bir korumadır; dışarı göstereceğimiz ad ve e-posta gibi alanları `toPublicUser()` ile ayrıca seçmek başka bir korumadır. **Sunucunun bildiği her bilgi, istemcinin görmesi gereken bilgi değildir.**

## Kullanıcı Bilgisinin Tamamına İhtiyacımız Var mı?

`authenticate` içindeki `User.findById(...)` sorgusunda `passwordHash` alanı, modeldeki `select: false` ayarı sayesinde normalde seçilmez. Buna rağmen kullanıcı belgesindeki bütün alanları doğrudan yanıt olarak göndermiyoruz:

```js
res.status(200).json({ data: toPublicUser(req.user) });
```

## Örnek 6

`toPublicUser` yalnızca dışarı gösterilecek alanları seçer. İleride hesabın rolü veya güvenlik bilgileri değişse bile aynı ayrımı korumamız gerekir.

Başka projelerde kullanıcıyı baştan sona bir Mongoose belgesi yerine daha küçük bir nesneyle taşımak da mümkündür:

```js
req.auth = {
  userId: user._id.toString(),
  role: user.role,
};
```
