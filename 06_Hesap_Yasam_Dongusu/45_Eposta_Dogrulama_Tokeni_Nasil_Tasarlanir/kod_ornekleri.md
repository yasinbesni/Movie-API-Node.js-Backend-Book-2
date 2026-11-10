# Bölüm 45 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# E-posta Doğrulama Belirteci (Token) Nasıl Tasarlanır?


## E-posta Bağlantısındaki Belirteç Ne İşe Yarayacak?

Ada'ya posta kutusuna erişimini kanıtlama fırsatı vereceğiz. Bunun için sunucunun önceden oluşturduğu, tahmin edilmesi güç ve süreli bir değeri e-posta bağlantısına koyması gerekiyor. **Bağlantı, kullanıcının parolasını veya bütün hesap bilgilerini taşımaz; belirli doğrulama işlemini tamamlamaya yarar.** Ham değerin nasıl üretileceğini ve sunucuda hangi karşılıkla tutulacağını tasarlayalım.

## Ada'nın Bağlantısındaki Sır Ne Olacak?

Ada'nın adresini bilmek, bağlantıyı doğru kişinin açtığını kanıtlamaz. Örneğin bağlantıya yalnızca kullanıcı ID'sini yazsak ne olur? ID gizli bir bilgi olmadığından, başka biri de aynı adresi oluşturabilir. Bu yüzden bağlantının içinde yalnız sunucunun üretebildiği, tahmin edilmesi güç bir değer bulunmalı.

Şöyle bir bağlantı yeterli değil:

```text
https://app.example.com/verify-email?userId=ada-id
```

## Örnek 2

Kullanıcı kimliği gizli bir parola değildir. Bunun yerine güçlü biçimde rastgele üretilen bir **belirteç (token)** kullanacağız. Belirtecin hangi hesaba ait olduğunu ve ne zaman geçersiz olacağını sunucu bilecek.

## Bu Belirteci Nasıl Saklayacağız?

Kısa ömürlü doğrulama belirteçlerini doğrudan `User` belgesine eklemek yerine ayrı bir `AccountToken` koleksiyonunda saklayacağız. Böylece hesaba ait kalıcı bilgilerle, süresi dolan veya kullanıldıktan sonra geçersizleşen doğrulama kayıtlarını birbirinden ayırabileceğiz.

Yeni dosya: `src/db/models/accountToken.js`

```js
import mongoose from "mongoose";

const accountTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["email_verify", "password_reset"],
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
    usedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export const AccountToken =
  mongoose.models.AccountToken ||
  mongoose.model("AccountToken", accountTokenSchema);
```

## Örnek 3

`unique`, MongoDB'de benzersiz indeks oluşturulmasını ister. Kullanılan veritabanında bu indeksin gerçekten oluştuğunu kontrol edeceğiz. `expiresAt` üzerindeki normal indeks **kayıtları kendiliğinden silmez**; süre dolduğunda sorguda ayrıca kontrol edeceğiz. Otomatik temizleme için TTL indeks tercih edilebilir, ama TTL temizliği anlık olmayabilir.

Ada'nın bağlantısındaki rastgele değere **E1** diyelim. Sunucu E1'i e-postaya koyar, veritabanında ise yalnızca E1'in hash'ini tutar. Ada bağlantıya bastığında gönderilen E1 yeniden hash'lenir ve kayıtla eşleştirilir. **Bir saldırgan veritabanındaki `tokenHash` değerini görse bile onu E1 yerine göndererek doğrulama yapamaz**: Sunucu gelen değere de `hashToken()` uygulayacağından, kayıtlı değerle eşleşmeyen başka bir hash hesaplanır. Bununla birlikte bağlantının kendisi sızarsa E1 hâlâ kullanılabilir; bu nedenle kısa ömür ve tek kullanım şarttır.

## Rastgele Değeri Üretelim

28. bölümde `src/utils/token.js` dosyasında `node:crypto` içinden `randomBytes` ve `createHash` kullanmıştık. Bunlar Node.js'in yerleşik modülüdür; ayrıca bir paket kurmuyoruz.

Aynı dosyaya, mevcut JWT ve yenileme belirteci fonksiyonlarını **silmeden** şunu ekleyin:

```js
export const createOpaqueToken = () =>
  randomBytes(32).toString("base64url");
```

## Örnek 4

`randomBytes` import'u dosyada zaten bulunuyor. Bu fonksiyon tahmin edilmesi güç, 32 rastgele bayttan oluşan bir değer üretir. `base64url`, değeri bağlantılarda taşımaya uygun metne dönüştürür; **şifreleme değildir**.

Ham E1 değerini veritabanına kaydetmeyeceğiz. Yenileme belirteçlerinde kullandığımız `hashToken()` fonksiyonuyla E1'in **SHA-256 hash değerini** hesaplayacağız:

```js
const rawToken = createOpaqueToken();
const tokenHash = hashToken(rawToken);
```

## Örnek 5

 ise E1'den hesaplanır ve MongoDB'de saklanır. Ada bağlantıyı kullandığında sunucu aynı hesaplamayla doğru kaydı bulur; ayrıca sürenin dolmadığını ve E1'in daha önce kullanılmadığını denetler.

## Neden Paroladaki Argon2id Yerine SHA-256 Kullanıyoruz?

Parolalar insanlar tarafından seçilir ve tahmin edilebilir. Bu yüzden 9. bölümde parola tahminlerini yavaşlatacak biçimde tasarlanmış Argon2id kullandık. E-posta doğrulama belirteci ise `randomBytes(32)` ile **uzun ve rastgele** üretiliyor; Ada'nın seçebileceği bir parola gibi sözlükten tahmin edilmeye elverişli değil. `hashToken()` ile sabit uzunluklu bir SHA-256 hash değeri hesaplayıp eşleşen kaydı hızlıca bulabiliriz. Böyle güçlü rastgele belirteçler için Argon2id'nin insan parolalarını korumak amacıyla eklediği yüksek hesaplama maliyetine ihtiyaç duymuyoruz.

`tokenHash` değerini ele geçiren biri, ham belirteci kolayca geri çıkaramaz. Fakat bu tasarımın güvenli kalması, rastgele değerin güçlü üretilmesine ve ham belirtecin loglara veya herkese açık yanıtlara yazılmamasına bağlıdır.

## Her Token Aynı İşe Yaramasın

Ada'nın e-posta doğrulama bağlantısını başka bir güvenlik işlemi için kabul etmemeliyiz. Bu yüzden `type` alanı var:

```js
const filter = {
  tokenHash,
  type: "email_verify",
  usedAt: null,
  expiresAt: { $gt: new Date() },
};
```
