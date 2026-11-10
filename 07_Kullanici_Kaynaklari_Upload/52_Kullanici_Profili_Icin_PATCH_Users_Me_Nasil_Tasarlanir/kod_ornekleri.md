# Bölüm 52 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

 üzerinde çalışıyoruz.*

**`name`**, hesabın görünen adını saklar: **Ada Y.** **`bio`** ise Ada'nın kendisini veya ilgi alanlarını kısa bir yazıyla tanıtmasına yarar. İngilizce *biography* sözcüğünden gelen `bio`, burada uzun bir yaşam öyküsü değil, kullanıcının isteğine bağlı bir **profil açıklaması** anlamındadır. Yani Ada'nın adını değiştirmek istemesiyle sevdiği film türlerini başkalarına anlatmak istemesi iki farklı ihtiyaçtır.

Ada hiçbir tanıtım yazısı eklemek zorunda değildir; `bio` boş kalabilir. Hesap açmak, giriş yapmak veya izleme listesi oluşturmak için bu alan kullanılmaz. Biz şu anda yalnızca `name` ve `bio` değerlerini API üzerinden güvenli biçimde güncelleyebileceği yapıyı hazırlıyoruz. Ada sadece adını değiştirdiğinde önceki “Hakkımda” yazısı korunacak; sadece açıklamasını değiştirdiğinde de görünen adı aynı kalacak.

## `req.body` İçindeki Her Alanı Neden Kaydetmiyoruz?

Ada kendi profilini güncellerken kullanıcı kimliğini URL'ye yazmak zorunda değil. `authenticate` ara katmanı kimliğini doğrulayıp `req.user` içine zaten yerleştiriyor. Dolayısıyla `PATCH /users/me` isteğinde *hangi hesabın* güncelleneceğini sunucu biliyor.

İlk bakışta şu kod yeterli görünebilir:

```http
PATCH /users/me
```

## Örnek 2



```js
await User.findByIdAndUpdate(
  req.user._id,
  req.body,
  { returnDocument: "after" },
);
```

## Örnek 3

Ama `req.body`, Ada'nın göndermeyi seçtiği **bütün alanları** içerebilir. Tarayıcıdaki formda yalnızca “Ad” kutusu bulunması, isteğe başka alanlar eklenmesini engellemez. Örneğin biri şu veriyi gönderebilir:

```json
{
  "role": "admin",
  "isActive": true,
  "authVersion": 0,
  "isEmailVerified": true
}
```

## Örnek 4

Böyle bir isteğin kullanıcıya yönetici yetkisi vermesine veya e-posta doğrulanmış gibi görünmesine izin veremeyiz. Aynı nedenle `passwordHash` gibi güvenlik alanlarını da profil düzenleme işleminin dışında tutacağız. **Kimlik denetimi** bize *kimin* istek gönderdiğini söyler; **alan denetimi** ise o kişinin *neyi* değiştirebileceğini belirler. İkisine de ihtiyacımız var.

## İzin Verilen Alanları Önceden Belirleyelim

Bu endpoint için yalnızca `name` ve `bio` alanlarını kabul edeceğiz. Yeni bir model oluşturmadan, mevcut `src/db/models/user.js` dosyasındaki `userSchema` tanımına `name` alanının yanına isteğe bağlı `bio` alanını ekleyin:

```js
bio: {
  type: String,
  trim: true,
  maxlength: 300,
  default: "",
},
```

## Örnek 5

. `maxlength: 300`, veritabanında saklanabilecek metnin uzunluğunu sınırlar. `default: ""` ise yeni bir kullanıcı kayıt olurken `bio` göndermediğinde alanın boş metinle başlamasını sağlar. **Ada'ya tanıtım yazısı yazma zorunluluğu getirmiyoruz.** Eski kayıtlarda `bio` henüz bulunmayabileceği için yanıt hazırlarken bunu da dikkate alacağız.

Peki e-posta adresi neden listede yok? Ada adını değiştirdiğinde giriş için kullandığı adres değişmez. Yeni e-posta adresine geçişte ise o posta kutusuna gerçekten erişebildiğini doğrulamamız gerekir. **Bu bölümün son kısmında `POST /users/me/email-change` ve onaylama yolunu oluşturup çalıştıracağız.** Önce sıradan profil güncellemesini bitirelim.

## Joi ile `PATCH` İsteğini Doğrulayalım

`PATCH`, kaydın tamamını yeniden göndermek yerine **yalnızca değişmesini istediğimiz alanları** göndermemizi sağlar. Ada sadece adını değiştirecekse `bio`yu göndermesine gerek yok. Kısa tanıtımını güncelleyecekse de `name` aynı kalır.

İstek gövdesini denetlemek için yeni `src/validation/users.js` dosyasında `updateProfileSchema` sözleşmesini oluşturun. `Joi` bu dosyada import edilmeli; mevcut `src/routers/users.js` dosyası da sözleşmeyi buradan kullanmalıdır:

```js
export const updateProfileSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(80),

  bio: Joi.string()
    .trim()
    .max(300)
    .allow(""),
}).min(1);
```

## Örnek 6

`name` ve `bio` burada tek tek zorunlu değil; ancak sondaki `.min(1)`, **hiç alan içermeyen bir istek** gönderilmesini engeller. `bio` için `.allow("")` eklememizin nedeni de açık: Ada tanıtım yazısını tamamen kaldırmak isterse boş metin gönderebilmeli. Joi, bu izin verilmezse boş metni varsayılan olarak reddeder. Sözleşmede tanımlamadığımız `role` veya `authVersion` gibi alanlar ise varsayılan Joi ayarlarıyla reddedilir. Doğrulama, Router'da `validateBody(updateProfileSchema)` aracılığıyla çalışacak.

Ada önce sadece tanıtım yazısını değiştirmek istesin:

```http
PATCH /users/me
Content-Type: application/json

{
  "bio": "Bilim kurgu ve macera filmlerini seviyorum."
}
```

## Örnek 7

Bu istekte `name` bulunmuyor. Sunucu Ada'nın adını silmemeli; yalnızca gelen `bio` değerini güncellemeli. Tersi durumda da aynı kural geçerli: yalnız `name` gönderilirse önceki `bio` korunmalı.

## Service: Sadece Güvendiğimiz Alanları Aktaralım

Joi kontrolüne ek olarak, veritabanına yazılacak alanları Service tarafında da açıkça seçiyoruz. Bunun için yeni `src/services/users.js` dosyasında `buildProfileUpdate` yardımcı işlevini tanımlayın. Hemen ardından yazacağımız `updateMyProfile` da **aynı dosyada** bulunacak:

```js
const buildProfileUpdate = (payload) => {
  const update = {};

  if (payload.name !== undefined) {
    update.name = payload.name;
  }

  if (payload.bio !== undefined) {
    update.bio = payload.bio;
  }

  return update;
};
```

## Örnek 8

Burada `!== undefined` önemli: Alan **gönderilmediyse** güncellemeye eklemiyoruz. Boş bırakılmış bir tanıtım yazısını temizlemek istersek `bio: ""` gönderebiliriz; bu değer `undefined` değildir ve güncellenebilir. `name` içinse Joi'nin en az iki karakter koşulu geçerlidir.

Bu yaklaşımın iki yararı var. Birincisi, istemci fazladan alan gönderse bile Service bunları veritabanına taşımaz. İkincisi, ileride hangi alanların düzenlenebileceğini değiştirmek istediğimizde kuralların nerede uygulandığını kolayca buluruz. Joi ile Service'deki alan seçimi birbirini tamamlar; biri isteği reddeder, diğeri veritabanına yazılacak veriyi sınırlar.

`updateMyProfile` fonksiyonunu `src/services/users.js` dosyasına, yukarıdaki `buildProfileUpdate` işlevinin yanına ekleyin. Dosyada `User` modeli `../db/models/user.js` yolundan import edilmelidir.

```js
export const updateMyProfile = async (
  userId,
  payload,
) => {
  const update = buildProfileUpdate(payload);

  return User.findByIdAndUpdate(
    userId,
    { $set: update },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );
};
```

## Örnek 9

`userId`, istemcinin yazdığı rastgele bir kimlik değil, doğrulanmış `req.user._id` değeridir. `$set` yalnızca seçtiğimiz alanları günceller. `returnDocument: "after"`, Controller'ın **değişiklikten sonraki** kullanıcı belgesini almasını sağlar; `runValidators: true` ise güncelleme sırasında Mongoose alan kurallarının da kontrol edilmesini ister.

## Controller, Router ve Kullanıcıya Dönen Yanıt

Controller, Service'den güncel kullanıcıyı alır ve yanıtı hazırlar. Bu işlevi mevcut `src/controllers/users.js` dosyasına ekleyin. `usersService` için `../services/users.js`, `toPublicUser` için `../utils/toPublicUser.js` importlarını kullanın:

```js
export const updateCurrentUser = async (req, res) => {
  const user = await usersService.updateMyProfile(
    req.user._id,
    req.body,
  );

  res.status(200).json({
    data: toPublicUser(user),
  });
};
```

## Örnek 10

Şimdi mevcut `src/routers/users.js` dosyasına `PATCH /me` yolunu ekleyin. `updateCurrentUser` işlevini Controller’dan, `updateProfileSchema` sözleşmesini `../validation/users.js` dosyasından import edin; mevcut `GET /me` yolunu koruyun:

```js
router.patch(
  "/me",
  authenticate,
  validateBody(updateProfileSchema),
  updateCurrentUser,
);
```

## Örnek 11

İşlem sırasını Ada'nın isteği üzerinde izleyelim: Önce `authenticate` hesabı bulur, ardından `validateBody` yalnızca izin verdiğimiz profil alanlarını kabul eder, Service bu alanları günceller, Controller da sonucu döndürür. **Yetkisiz alanların engellenmesi yalnızca arayüzdeki formu gizlemeye bağlı değildir.** Kontrol, sunucunun içinde de uygulanır.

Burada gözden kaçabilecek bir ayrıntı var: `toPublicUser` yardımcı fonksiyonunu daha önce oluştururken `bio` henüz yoktu. Şimdi modele eklesek ve veritabanına başarıyla yazsak bile **bu fonksiyona `bio`yu eklemezsek API yanıtında görünmez.** `src/utils/toPublicUser.js` dosyasındaki mevcut fonksiyonu aşağıdaki son hâliyle güncelleyin; aynı isimle ikinci bir fonksiyon oluşturmayın:

```js
export const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  bio: user.bio ?? "",
  createdAt: user.createdAt,
});
```

## Örnek 12

`?? ""` ifadesi, daha eski kullanıcı kayıtlarında `bio` alanı bulunmadığında boş metin döndürür. Bu fonksiyon hâlâ `passwordHash`, `role` veya `authVersion` gibi iç alanları yanıta eklemez. Adındaki *public*, bütün bilgilerin internette herkese açık olduğu anlamına gelmez; **API yanıtında paylaşılmasına izin verdiğimiz alanları** seçtiğimizi anlatır. Bu örnekte yanıt, kendi hesabını güncelleyen Ada'ya gönderiliyor.

Ada'nın `bio` güncellemesinden sonra yanıtın ilgili alanları şöyle olacaktır:

```json
{
  "data": {
    "name": "Ada Y.",
    "bio": "Bilim kurgu ve macera filmlerini seviyorum."
  }
}
```

## Örnek 13

ğerlerle değişmemeli. Böylece yalnızca örneğin başarıyla çalıştığını değil, **hangi değişiklikleri özellikle engellediğimizi** de görmüş olacağız.

## E-posta Adresini Neden Aynı İstekle Değiştirmiyoruz?

Ada'nın görünen adını ya da “Hakkımda” yazısını değiştirmesiyle giriş ve hesap kurtarma için kullandığı e-posta adresini değiştirmesi farklı işlemlerdir. Ada, `ada@example.com` adresinden `ada.yeni@example.com` adresine geçmek istiyor. **Yeni adresi doğrudan `PATCH /users/me` içine ekleseydik**, yanlış yazılmış veya başka birine ait bir adresi hemen hesabına kaydetme tehlikesi doğardı. Daha kötüsü, Ada'nın giriş bilgilerini ele geçiren biri parola sıfırlama e-postalarının gittiği adresi değiştirmeyi deneyebilirdi.

Bu yüzden iki ayrı adım uygulayacağız. Ada önce **kendi parolasını yeniden girerek** adres değiştirme isteği başlatacak. Movie API, yeni adrese tek kullanımlık bir doğrulama kodu gönderecek fakat hesabındaki eski adresi değiştirmeyecek. Ada yeni posta kutusundaki kodu kullanırsa adres güncellenecek. **Doğrulama tamamlanmazsa eski adres kullanılmaya devam edecek.**

İki HTTP yolunu **bu bölümde gerçekten oluşturuyoruz**; sonraki bölümlere ertelenmiş bir özellik değiller:

```http
POST /users/me/email-change
POST /users/me/email-change/confirm
```

## Örnek 14

İlk yol **giriş yapmış Ada'nın** yeni adres için doğrulama istemesini sağlar. İkinci yol, e-posta ile alınan gizli kodu doğrulayıp adres değişikliğini tamamlar. Kullanıcı henüz giriş yapmamış başka bir cihazdan kodu onaylayabileceği için ikinci yol ayrıca JWT istemez; burada kimlik doğrulamanın anahtarı, tahmin edilmesi güç, süreli ve tek kullanımlık kodun kendisidir. Kodu ele geçiren biri de işlemi yapabileceğinden bu sır hiçbir zaman loglara yazılmamalıdır.

### Mevcut belirteç modelini genişletelim

45. bölümde oluşturduğumuz `src/db/models/accountToken.js` dosyasındaki `type` alanının `enum` listesini şu **son hâline** getirin. İkinci bir `type` alanı eklemeyin:

```js
enum: ["email_verify", "password_reset", "email_change"],
```

## Örnek 15

Aynı dosyanın `accountTokenSchema` alanlarına aşağıdaki iki isteğe bağlı bilgiyi ekleyin:

```js
emailBeforeChange: {
  type: String,
  trim: true,
  lowercase: true,
},
newEmail: {
  type: String,
  trim: true,
  lowercase: true,
},
authVersionAtIssue: {
  type: Number,
},
```

## Örnek 16

`email_verify` bir hesabın **mevcut** e-posta adresini doğrulamak içindi; `email_change` ise **yeni** adrese geçişi onaylamak için ayrı bir işlem türüdür. Böylece parola sıfırlama veya ilk e-posta doğrulama kodu, adres değiştirme isteğinde kullanılamaz. `emailBeforeChange` eski adresi, `newEmail` ise henüz onaylanmamış yeni adresi belirtir. Bu alanlar yalnız `email_change` kayıtlarında doldurulur; önceki belirteçleri bozmayız. `authVersionAtIssue`, 49. bölümde kullandığımız güvenlik sayacının **kod oluşturulduğu andaki değerini** tutar. Ada bu sırada parolasını sıfırlayıp sayacı artırırsa eski adres değiştirme kodu da kabul edilmeyecek.

### Yeni isteğin sınırlarını belirleyelim

`src/validation/users.js` dosyasına, `updateProfileSchema` tanımını koruyarak şu iki Joi sözleşmesini ekleyin (`Joi` aynı dosyada zaten import edilmişti):

```js
export const requestEmailChangeSchema = Joi.object({
  newEmail: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

export const confirmEmailChangeSchema = Joi.object({
  token: Joi.string().trim().required(),
});
```

## Örnek 17

İlk istekte Ada'nın mevcut parolasını yeniden istememizin nedeni, tarayıcısında açık kalmış bir erişim JWT'sinin bu önemli hesap değişikliği için **tek başına yeterli olmamasını** sağlamaktır. İkinci istekte parola yerine e-postadaki tek kullanımlık kodu doğrulayacağız. `newEmail` henüz User kaydına yazılmayacak; yalnız onay bekleyen belirteç kaydında tutulacak.

Ada'nın isteği şöyle görünecek:

```http
POST /users/me/email-change
Content-Type: application/json

{
  "newEmail": "ada.yeni@example.com",
  "password": "Ada'nin-mevcut-parolasi"
}
```

## Örnek 18

### Doğrulama kodunu yeni adrese gönderelim

E-posta göndermek için 50. bölümdeki ortak SMTP hizmetini kullanıyoruz. `src/services/accountEmails.js` dosyasında mevcut fonksiyonları silmeden `sendEmailChangeCode` fonksiyonunu ekleyin. `sendEmail`, `./email.js` dosyasından zaten import edilmişti:

```js
export const sendEmailChangeCode = (to, rawToken) =>
  sendEmail({
    to,
    subject: "Yeni e-posta adresini doğrula",
    text: [
      "Movie API hesabınızın e-posta adresi için değişiklik istendi.",
      "Doğrulama kodunuz:",
      rawToken,
      "Bu kodu e-posta değişikliği onay isteğinde kullanın.",
      "İsteği siz yapmadıysanız bu mesajı yok sayın.",
    ].join("\n"),
  });
```

## Örnek 19

Bu uygulamada ön yüz doğrulama sayfası oluşturmadığımız için e-postada **doğrudan kullanabileceğimiz bir kod** gönderiyoruz. Ada kodu HTTP istemcisindeki onay isteğine yapıştırabilir. Gerçekte var olmayan bir `GET` sayfasını bağlantı diye göstermiyoruz. Kod 32 rastgele bayttan üretildiğinden kısa bir SMS kodu gibi elle tahmin edilemez; kopyalanarak kullanılması beklenir.

Şimdi `src/services/users.js` dosyasındaki profil güncelleme fonksiyonlarını **koruyun** ve aşağıdaki yeni `requestEmailChange` fonksiyonunu ekleyin. Dosyanın import listesine `AccountToken` (`../db/models/accountToken.js`), `createOpaqueToken` ve `hashToken` (`../utils/token.js`), `verifyPassword` (`../utils/password.js`) ve `sendEmailChangeCode` (`./accountEmails.js`) eklenmelidir. `User` modeli zaten bu dosyada kullanılıyor.

```js
const emailChangeError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

export const requestEmailChange = async (userId, newEmail, password) => {
  const user = await User.findById(userId).select("+passwordHash");

  if (!user || user.isActive === false ||
      !(await verifyPassword(user.passwordHash, password))) {
    throw emailChangeError("Kimlik bilgileri doğrulanamadı.", 401);
  }
  if (user.email === newEmail) {
    throw emailChangeError("Bu adres zaten hesabınızda kayıtlı.", 400);
  }
  if (await User.exists({ email: newEmail })) {
    throw emailChangeError("Bu adres kullanılamıyor.", 409);
  }

  await AccountToken.updateMany(
    { userId, type: "email_change", usedAt: null },
    { $set: { usedAt: new Date() } },
  );

  const rawToken = createOpaqueToken();
  const token = await AccountToken.create({
    userId,
    type: "email_change",
    tokenHash: hashToken(rawToken),
    emailBeforeChange: user.email,
    newEmail,
    authVersionAtIssue: user.authVersion ?? 0,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  });

  try {
    await sendEmailChangeCode(newEmail, rawToken);
  } catch (error) {
    await AccountToken.updateOne(
      { _id: token._id, usedAt: null },
      { $set: { usedAt: new Date() } },
    );
    throw error;
  }
};
```

## Örnek 20

Bu kodda dört önemli adım var. Ada'nın parolası, User modelinde `select: false` olan `passwordHash` alanı özellikle seçilerek doğrulanıyor. Yeni adres başka bir hesapta kayıtlıysa işlem duruyor. Aynı hesap için daha önce üretilmiş, kullanılmamış adres değiştirme kodları devre dışı bırakılıyor. Son olarak yeni bir kodun **yalnızca hash değeri** MongoDB'ye yazılıyor; ham kod yeni adrese e-postayla gönderiliyor.

SMTP gönderimi hata verirse oluşturduğumuz kodu da geçersiz kılıyoruz. Ancak SMTP'nin isteği kabul etmesi, postanın kesin teslim edildiği anlamına gelmez. Bu yolun kötüye kullanılmasını önlemek için istek sıklığını sınırlamak gerekir. Kodun üretilmesiyle e-posta gönderimi farklı sistemlerde gerçekleştiğinden eşzamanlı gönderimler ve teslim edilememe durumları canlı kullanımda ayrıca test edilmelidir.

### Ada kodu onayladığında neler değişecek?

Ada yeni posta kutusunu açıp kodu gördü. Şimdi `POST /users/me/email-change/confirm` isteğini gönderiyor:

```http
POST /users/me/email-change/confirm
Content-Type: application/json

{
  "token": "epostada-gelen-uzun-onay-kodu"
}
```

## Örnek 21

Onay başarılı olursa yalnız e-posta adresini değiştirmeyeceğiz. **Eski JWT'leri reddetmek için `authVersion` sayacını artıracak**, aktif yenileme belirteçlerini de iptal edeceğiz. Böylece hesabın kurtarma adresi değiştikten sonra eski cihazlarda kalan giriş bilgileriyle işlem yapılmasını önleyeceğiz. Ada, yeni e-posta adresi ve mevcut parolasıyla tekrar giriş yapacak. Başka cihazların ekranı kendiliğinden kapanmaz; eski JWT'lerle korumalı istek gönderdiklerinde `401` alırlar.

Burada birbirine bağlı veritabanı yazımları var: Onay kodunu tüketmek, e-posta adresini değiştirmek, güvenlik sayacını artırmak ve eski yenileme haklarını iptal etmek. **Bir adım gerçekleşip diğeri başarısız kalmamalı.** 49. bölümde parola sıfırlarken kullandığımız MongoDB transaction yaklaşımını burada da uygulayacağız. Bu işlem için MongoDB dağıtımının transaction desteklemesi gerekir.

`src/services/users.js` dosyasına şu fonksiyonu da ekleyin. Dosyanın import listesine `mongoose` ve `RefreshToken` (`../db/models/refreshToken.js`) eklenmelidir. `AccountToken` ve `hashToken` az önce eklendiğinden ikinci kez import etmeyin:

```js
export const confirmEmailChange = async (rawToken) => {
  try {
    await mongoose.connection.transaction(async (session) => {
      const now = new Date();
      const token = await AccountToken.findOneAndUpdate(
        {
          tokenHash: hashToken(rawToken),
          type: "email_change",
          usedAt: null,
          expiresAt: { $gt: now },
        },
        { $set: { usedAt: now } },
        { returnDocument: "before", session },
      );

      if (!token) {
        throw emailChangeError("Kod geçersiz veya süresi dolmuş.", 400);
      }

      const user = await User.findOneAndUpdate(
        {
          _id: token.userId,
          email: token.emailBeforeChange,
          isActive: { $ne: false },
          $expr: {
            $eq: [
              { $ifNull: ["$authVersion", 0] },
              token.authVersionAtIssue,
            ],
          },
        },
        {
          $set: { email: token.newEmail, isEmailVerified: true },
          $inc: { authVersion: 1 },
        },
        { returnDocument: "after", runValidators: true, session },
      );

      if (!user) {
        throw emailChangeError("Hesap veya eski adres artık eşleşmiyor.", 400);
      }

      await RefreshToken.updateMany(
        { userId: token.userId, revokedAt: null },
        { $set: { revokedAt: now } },
        { session },
      );
      await AccountToken.updateMany(
        { userId: token.userId, type: "email_change", usedAt: null },
        { $set: { usedAt: now } },
        { session },
      );
    });
  } catch (error) {
    if (error.code === 11000) {
      throw emailChangeError("Yeni e-posta adresi kullanılamıyor.", 409);
    }
    throw error;
  }
};
```

## Örnek 22

r. Böylece Ada parolasını sıfırlayıp eski girişleri iptal ettikten sonra daha önce üretilmiş adres değiştirme koduyla işlem yapılamaz.

`unique` indeksinin önemi burada yeniden görülüyor: Ada kodu aldıktan sonra Deniz de aynı yeni adresle hesap açmış olabilir. İlk sorguda adres boş görünmüş olması yeterli değildir. MongoDB e-posta benzersizliğini son yazımda da denetler; `11000` hatası oluşursa transaction geri alınır ve Ada'ya `409 Conflict` yanıtı döndürürüz. **`AccountToken` kaydı böyle bir başarısızlıkta tüketilmiş kalmaz.**

Bunun bir sınırı var: Aynı anda başka bir cihazda yeni token üreten isteklerin nasıl sıralandığı, transaction dışındaki oturum işlemleri ve e-posta teslimi ayrıca değerlendirilmelidir. Transaction tek başına bütün ağ ve eşzamanlılık sorunlarını çözmez. Ayrıca `express-session` kayıtlarının silinmesi bu kodun parçası değildir; `authVersion` denetimi JWT ile korunan istekler için geçerlidir.

### Controller ve Router bağlantısını tamamlayalım

`src/controllers/users.js` dosyasına iki yeni fonksiyon ekleyin. `usersService` import'u profil güncellemesinde zaten kullanılıyor. `clearAuthCookies` fonksiyonunu ise `../utils/authCookies.js` dosyasından import edin:

```js
export const requestEmailChangeController = async (req, res) => {
  await usersService.requestEmailChange(
    req.user._id,
    req.body.newEmail,
    req.body.password,
  );
  res.status(202).json({
    message: "Yeni adrese doğrulama kodu gönderilmesi istendi.",
  });
};

export const confirmEmailChangeController = async (req, res) => {
  await usersService.confirmEmailChange(req.body.token);
  clearAuthCookies(res);
  res.status(200).json({
    message: "E-posta adresi değiştirildi. Yeniden giriş yapın.",
  });
};
```

## Örnek 23

`clearAuthCookies()` bu isteği yapan tarayıcıya JWT çerezlerini temizlemesini söyler; **başka cihazların çerezlerini uzaktan silemez**. Onlardaki eski JWT'ler, 49. bölümde `authenticate` içine yerleştirdiğimiz `authVersion` karşılaştırması sayesinde bir sonraki korumalı istekte reddedilir. Doğrulama kodu başka bir cihazda kullanılmış olsa da bütün JWT girişleri sunucu tarafındaki sayaçtan etkilenir.

Son olarak `src/routers/users.js` dosyasına mevcut `GET /me` ve `PATCH /me` yollarını koruyarak iki yeni yol ekleyin. `requestEmailChangeSchema` ve `confirmEmailChangeSchema` (`../validation/users.js`), iki Controller (`../controllers/users.js`) dosyasından import edilmeli; mevcut `authenticate` ve `validateBody` import'ları yeniden yazılmamalıdır:

```js
router.post(
  "/me/email-change",
  authenticate,
  validateBody(requestEmailChangeSchema),
  requestEmailChangeController,
);

router.post(
  "/me/email-change/confirm",
  validateBody(confirmEmailChangeSchema),
  confirmEmailChangeController,
);
```
