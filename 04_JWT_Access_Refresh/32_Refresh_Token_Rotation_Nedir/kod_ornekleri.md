# Bölüm 32 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

lanmış.**

Rotation yokken saldırgan da Ada da aynı R1'i, geçerli kaldığı sürece tekrar tekrar kullanabilir. Rotation eklediğimizde R1 yalnızca **bir kez** başarıyla kullanılabilir. Ancak önemli bir sınır var: **R1'i ilk gönderen saldırgansa sunucu onun isteğini kabul edebilir ve yeni R2'yi saldırgana verebilir.** Rotation, ilk kötüye kullanımı otomatik engellemez; sonraki R1 tekrarını görünür hâle getirir.

Sunucu “ilk isteği yapan kesin Ada'dır” sonucuna varamaz. Bu nedenle rotation'ı tek başına hırsızlığa karşı kilit değil, **yenileme belirtecinin tekrar kullanımını tespit etmeye yardım eden bir yöntem** olarak düşünmeliyiz.

## Tek Kullanımlık Yenileme Zincirini Kuralım

İlk yenileme uygulamamızda aynı R1, geçerli kaldığı sürece yeni access token üretmek için yeniden kullanılabiliyordu. Artık bu özelliği değiştireceğiz: Başarılı yenileme eski kaydı tüketmeli, sunucu yeni bir belirteç üretmeli ve iki istek aynı R1'i aynı anda sunsa bile yalnız biri başarıyla tamamlanmalıdır.

Bu kez her başarılı yenilemede eski belirteci geçersiz kılıp yenisini vereceğiz. Buna **rotation (her kullanımda yenileme)** denir. `R1 → R2` geçişinden sonra `R1` artık yeni bir access token üretmemelidir:

```text
R1 ──yenile──► R2 ──yenile──► R3
   R1 biter      R2 biter
```

## Örnek 2

Bu çözüm çalınmış bir belirteci tek başına bulmaz; ancak eski bir belirteç tekrar kullanıldığında bunu fark edebilmemiz için iz bırakır.

Örneğin Ada `R1` ile yenileme yaptığında `R1` artık kullanılmış sayılacak ve tarayıcısına `R2` verilecek. Her iki belirteç de aynı girişten doğmuş olsa bile **o anda yalnızca en yeni ve geçerli olanla yenileme yapılmasını** istiyoruz. Sadece daha uzun rastgele değer üretmek, bu kullanım sırasını korumaz.

## Modelde İki Yeni Bilgi

29. bölümdeki `src/db/models/refreshToken.js` şemasına şu iki alanı **ekleyin**:

```js
familyId: {
  type: String,
  required: true,
  index: true,
},
usedAt: {
  type: Date,
  default: null,
},
```

## Örnek 3

`familyId` (*yenileme zincirinin ortak kimliği*), aynı girişten üretilen R1, R2 ve sonraki belirteç kayıtlarını birbirine bağlar. `usedAt` (*kullanılma zamanı*), hangi belirtecin tüketildiğini gösterir.

Bu yeni `required` alanı, önceden oluşturulmuş test belirteçlerinde bulunmuyor. Denemeye başlamadan önce **yalnızca test ortamındaki eski yenileme kayıtlarını temizleyip tekrar giriş yapın**; üretim veritabanını silmeyin. Gerçek sistemde böyle bir şema değişikliği ayrıca veri geçişi planı gerektirir.

## Yenileme Zincirinin İlk Kaydını Oluşturalım

`src/services/auth.js` dosyasındaki **mevcut** `issueRefreshToken()` fonksiyonunu aşağıdaki sürümle değiştiriyoruz. İkinci bir fonksiyon eklemiyoruz:

```js
import { randomUUID } from "node:crypto";

export const issueRefreshToken = async (
  userId,
  familyId = randomUUID(),
) => {
  const rawToken = createRefreshToken();

  await RefreshToken.create({
    userId,
    familyId,
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return rawToken;
};
```

## Örnek 4

`createRefreshToken`, `hashToken` ve `RefreshToken` import'ları dosyada zaten vardı. Yeni olan `randomUUID` import'u ve yenileme kayıtlarının ortak kimliğini korumamızdır. İlk JWT girişinde yeni bir `familyId` oluşturulur; belirteç yenilendiğinde eski kaydın `familyId` değeri yeni kayda aktarılır.

## İki İstek Aynı Belirteci Kullanırsa

“Önce oku, sonra kullanıldı diye kaydet” yaklaşımında birbirine çok yakın iki istek aynı kaydı henüz kullanılmamış görebilir. Bu yüzden kontrolü ve güncellemeyi tek veritabanı işleminde birleştireceğiz.

31. bölümün `refreshAccessToken()` fonksiyonunu artık kullanmıyoruz. Aynı `src/services/auth.js` dosyasına yeni sürümü ekliyor, eski `refreshAccessToken` fonksiyonunu kaldırıyoruz:

```js
export const rotateRefreshToken = async (rawToken) => {
  const tokenHash = hashToken(rawToken);
  const previous = await RefreshToken.findOneAndUpdate(
    {
      tokenHash,
      usedAt: null,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    },
    { $set: { usedAt: new Date() } },
    { returnDocument: "before" },
  );

  if (!previous) {
    throwUnauthorized();
  }

  const user = await User.findById(previous.userId);
  if (!user) {
    throwUnauthorized();
  }

  const refreshToken = await issueRefreshToken(
    user._id,
    previous.familyId,
  );

  return {
    accessToken: createAccessToken(user._id.toString()),
    refreshToken,
    user,
  };
};
```

## Örnek 5

Unauthorized()` 31. bölümde aynı Service dosyasına yazdığımız yardımcı fonksiyon; onu koruyoruz. Burada kullandığımız yöntem **atomik güncelleme** olarak adlandırılır. *Atomik* demek, R1 kaydını kontrol etme ve güncelleme adımlarının **tek, bölünmez bir veritabanı işlemi gibi** ele alınması demektir. Sunucu R1'i “kullanılmamış” olarak bulurken başka bir isteğin araya girip aynı R1'i tüketmesine izin verilmez.

Ada'nın tarayıcısından ve saldırganın bilgisayarından aynı R1 ile iki istek geldiğini düşünelim. İkisi de ayrı ayrı önce `findOne()` ile kayıt okusaydı, ikisi de R1'i kullanılmamış görebilirdi. Oysa koşullu `findOneAndUpdate()` kullandığımızda ilk başarılı istek `usedAt` alanına tarih yazar. İkinci istek artık **`usedAt: null` koşulunu sağlayan** bir R1 kaydı bulamaz ve aynı token'la başarılı yenileme yapamaz.

**Atomik olan yalnızca R1 kaydı üzerindeki bu güncellemedir.** Yeni R2 kaydının oluşturulması başka bir veritabanı işlemidir. R1'in tüketilmesini güvenceye almamız, R2'nin de mutlaka oluşturulacağı anlamına gelmez.

## Controller İki Çerezi Değiştirsin

`src/controllers/auth.js` içindeki `refreshSession` fonksiyonunu 31. bölümdeki sürümün **yerine** şöyle düzenliyoruz:

```js
import { setAuthCookies } from "../utils/authCookies.js";

export const refreshSession = async (req, res) => {
  const rawToken = req.cookies?.refreshToken;
  if (!rawToken) {
    const error = new Error("Oturum yenilenemedi.");
    error.status = 401;
    throw error;
  }

  const { accessToken, refreshToken, user } =
    await authService.rotateRefreshToken(rawToken);

  setAuthCookies(res, accessToken, refreshToken);
  res.status(200).json({ data: toPublicUser(user) });
};
```
