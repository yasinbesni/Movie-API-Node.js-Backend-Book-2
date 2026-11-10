# Bölüm 29 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

ran rotation düzenini kurmadık; onu ayrıca ekleyeceğiz.

Saldırganın telefonla birlikte ele geçirdiği belirtece **R1** diyelim. R1'in rastgele üretilmiş olması, başka birinin aynı değeri tahmin etmesini çok zorlaştırır; fakat elinde R1'in aynısı olan kişiyle Ada arasında görünür bir fark oluşturmaz. Sunucuya ulaşan istekte R1'in hangi hesaba ait olduğunu bulmak mümkündür, **R1'i gerçekte kimin gönderdiğini yalnız bu değerden anlamak mümkün değildir**. Bu yüzden doğru soru “Token metni tanıdık mı?” değil, “Bu token için yenilemeye hâlâ izin var mı?” sorusudur.

Ada kayıp telefonu bildirince R1'e karşılık gelen kayıt iptal edilebilirse, saldırganın sonraki yenileme denemesi reddedilir. Ancak saldırganın daha önce aldığı access token ayrıca geçersizleştirilmiyorsa kendi süresi bitene kadar çalışabilir. **Yenileme hakkını kesmekle daha önce verilmiş erişimi aynı anda kesmek farklı işlerdir.**

## Bir Model Oluşturalım

Yenileme belirtecini MongoDB’de saklamak için bir Mongoose modeli oluşturacağız. **Schema** belgenin alanlarını ve kurallarını tanımlar; **Model** ise uygulamanın bu kayıtları oluşturmasını, bulmasını ve güncellemesini sağlar.

Yeni dosya `src/db/models/refreshToken.js`:

```js
import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export const RefreshToken = mongoose.model(
  "RefreshToken",
  refreshTokenSchema,
);
```

## Örnek 2

ynı zamanda “Sadece access token çalındı” ile “yenileme hakkı da ele geçirildi” olaylarına farklı tepki verebilmemizin temelidir.

`expiresAt` ile `revokedAt` ayrımını da bu örnekte görebiliriz: Telefonun belirtecinin süresi henüz dolmamış olabilir; fakat Ada telefonu kaybettiği için onu önceden iptal etmek isteyebilir. Bu yüzden yalnız “kayıt var mı?” diye bakmak yetmez; süre ve iptal durumu da kontrol edilir.

Örneğin aynı Ada hesabına bağlı telefon ve bilgisayar için **iki ayrı refresh token** üretilir. MongoDB'de `userId` aynı olsa da `tokenHash` farklıdır. Bu, hesapla yenileme kaydının aynı şey olmadığını gösterir. Yalnız bu modelde henüz **cihaz adı veya cihaz kimliği alanı yoktur**: “Ada'nın hangi kaydı telefonuna aittir?” sorusunu yalnız `userId` ve `tokenHash` alanlarından otomatik olarak cevaplayamayız. Kullanıcıya cihaz listesinden tek bir girişini kapatma özelliği sunacaksak oturum/cihaz eşlemesini ayrıca tasarlamamız gerekir; aşağıdaki model tek başına o özelliği sunmaz.

## Kaydı Gerçekten Oluşturalım

`src/services/auth.js` dosyamızda kayıt ve giriş işlevleri zaten bulunuyor. Aşağıdaki import ve fonksiyonu **bu dosyaya ekliyoruz**, mevcut fonksiyonları kaldırmıyoruz:

```js
import { RefreshToken } from "../db/models/refreshToken.js";
import {
  createRefreshToken,
  hashToken,
} from "../utils/token.js";

export const issueRefreshToken = async (userId) => {
  const rawToken = createRefreshToken();

  await RefreshToken.create({
    userId,
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ),
  });

  return rawToken;
};
```

## Örnek 3

Fonksiyonu Ada'nın kimliğiyle çağırdığımızda önce rastgele token oluşturuluyor. Ardından **bu token'ın hash'i, Ada'nın `userId` değeri ve yedi gün sonraki bitiş tarihi** MongoDB'ye yazılıyor. En sonunda fonksiyon, tarayıcıya gönderebilmemiz için **yalnızca ham token'ı** döndürüyor. Aynı ham değerin veritabanı belgesinde bulunmaması bilinçli bir güvenlik kararı.

Bu fonksiyonun dönüş değeri, tarayıcıya gönderilebilecek **ham belirteç**; veritabanındaki karşılığı ise **hash ve geçerlilik kaydı**. Aynı değerin iki yerde aynı biçimde tutulmamasını bu nedenle seçiyoruz.

Bir sonraki yenileme isteğinde gelen R1'i aynı `hashToken()` fonksiyonundan geçirdiğimizde MongoDB'de saklanan `tokenHash` değeriyle eşleştirebileceğiz. Böylece veritabanında **ham R1'i tutmadan eşleştirme** yapılabilir. Ancak henüz bu eşleştirmeyi yapan HTTP yolunu veya kullanıcıya cihaz seçerek iptal yaptıran ekranı kurmadık.

## Kayıt Var Diye Belirteç Geçerli midir?

Hayır. Veritabanında bir belge bulmamız yalnızca "bir zamanlar oluşturulmuş" olduğunu gösterir. 31. bölümdeki yenileme işleminde ayrıca şunları kontrol edeceğiz:

```text
tokenHash eşleşiyor mu?
revokedAt boş mu?
expiresAt henüz geçmedi mi?
User hesabı hâlâ kullanılabilir mi?
```
