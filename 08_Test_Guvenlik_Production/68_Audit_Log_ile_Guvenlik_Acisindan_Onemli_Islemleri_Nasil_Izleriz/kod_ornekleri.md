# Bölüm 68 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# Denetim Kaydı (Audit Log) ile Önemli Güvenlik İşlemlerini Nasıl İzleriz?


## İşlem Tamamlandı; Daha Sonra Ne Olduğunu Nasıl Bileceğiz?

Ada, hesabının e-posta adresinin değiştirildiğini fark ettiğinde “Bu işlem ne zaman yapıldı?” diye sorabilir. `User` kaydında artık yeni adres yazdığı için tek başına bu belge bize olayın geçmişini anlatmaz. **Güvenlik açısından önemli işlemlerin izini ayrıca tutmamız gerekir.** Buna **denetim kaydı (audit log)** diyoruz.

## Uygulama Günlüğü ve Denetim Kaydı Farklı Soruları Yanıtlar

**Uygulama günlüğü (application log)**, sunucu hatalarını araştırmamıza yardım eder: Örneğin “veritabanı bağlantısı koptu” veya “istek `500` döndü” diye not düşer. **Denetim kaydı (audit log)** ise hesap güvenliğinde önemli bir eylemi izler: “Ada'nın hesabında parola sıfırlandı” veya “yönetici bir kullanıcının rolünü değiştirdi” gibi.

```text
Uygulama günlüğü → Sistem neden hata verdi?
Denetim kaydı    → Hangi önemli işlem, ne zaman ve hangi hesapta oldu?
```

## Örnek 2

Örneğin saat 14.05'te Ada'nın parolası sıfırlandıysa denetim kaydına olay türünü, ilgili hesabı ve zamanı ekleyebiliriz. **Yeni parolayı, ham sıfırlama belirtecini veya çerezleri kaydetmeyiz.** Böylece sonradan inceleme için iz bırakırken yeni bir sızıntı yaratmayız.

## AuditEvent Modeli

Ada'nın hesabında gece yarısı bir parola sıfırlama işlemi gerçekleşmiş olsun. Günler sonra Ada bu işlemi kendisinin yapmadığını söylediğinde yalnız “sunucu hata vermedi” bilgisi işe yaramaz. **İşlemin türünü, zamanını ve ilgili hesabı** saklayan denetim kaydı (audit log) böyle bir olayın araştırılmasına yardımcı olur. Parolanın veya belirtecin kendisini kayda geçirmek ise tam tersine yeni bir güvenlik riski oluşturur.

Denetim olayı için önerilen model dosyası `src/db/models/auditEvent.js` olacaktır. Gösterilen şema tamamlanmış bir model dosyası değildir; `mongoose` importu ve modelin dışa aktarımı gerekir.

```js
const auditEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      index: true,
    },
    actorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    targetType: {
      type: String,
      default: null,
    },
    targetId: {
      type: String,
      default: null,
    },
    ip: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
  },
  { timestamps: true },
);
```

## Örnek 3

Bu şemada `actorUserId` işlemi yapan hesabı, `targetId` etkilenen kaydı, `createdAt` ise `timestamps` ayarıyla kaydedilen zamanı belirtir. `metadata` alanı olaya ait **sır içermeyen ek bilgiler** içindir; içeriği sınırsızca doldurmamalıyız. IP ve tarayıcı bilgileri kişisel veri olabileceğinden erişim yetkileri ile saklama süresini belirlemek gerekir. Bu örnek model ayrıca `mongoose.model()` ile dışa aktarılmadan kullanılamaz.

---

## Olay Adlarını Neden Tek Yerde Tanımlıyoruz?

Olay adlarını kodun farklı yerlerine yazmak yerine yeni `src/constants/auditEvents.js` dosyasında sabit olarak tutabiliriz. Böylece Service ve Controller’lar aynı adları kullanır:

```js
export const AUDIT_EVENTS = {
  LOGIN_SUCCESS: "AUTH_LOGIN_SUCCESS",
  LOGIN_FAILED: "AUTH_LOGIN_FAILED",
  REFRESH_REUSE: "AUTH_REFRESH_REUSE_DETECTED",
  PASSWORD_RESET: "AUTH_PASSWORD_RESET",
  ACCOUNT_DISABLED: "ACCOUNT_DISABLED",
  ADMIN_MOVIE_DELETE: "ADMIN_MOVIE_DELETE",
};
```

## Örnek 4

Böylece kayıtları incelerken aynı olay bir yerde `password_changed`, başka yerde `changePassword` adıyla görünmez. Yönetim ekranında veya raporda aynı olayı doğru biçimde sayabiliriz.

---

Aynı olayın farklı adlarla kayda geçmesi aramayı zorlaştırır. `AUTH_PASSWORD_RESET` gibi ortak adlar kullanınca “bu olay kaç kez yaşandı?” sorusunu doğru cevaplayabiliriz. Ama bu tutarlılık **yalnız olayı tanımlar**; olayın bütün gizli içeriğini yazmamızı gerektirmez.

## Denetim Kaydında Hangi Bilgiler Bulunmamalı?

Audit log'a bile şunları koymayız:

```text
raw password
passwordHash
access token
refresh token
reset token
session id raw değeri
SMTP password
API secret
```

## Örnek 5

“Araştırma için lazım” diyerek ham belirteci veya parolayı kaydetmek yeni bir gizli bilgi deposu oluşturur. Denetim kaydı, şüpheli olayı incelemeyi sağlamalı; o işlemi yeniden yapabilecek sırları saklamamalıdır.

Gerekli korelasyon için non-secret ID veya kontrollü hash kullanılabilir.

---

## Başarısız Giriş İçin Denetim Kaydı

Client'a ortak mesaj:

```text
E-posta veya parola hatalı.
```

## Örnek 6

verirken internal audit event reason taşıyabilir:

Bu kayıt çağrısı, `src/services/audit.js` içinde tanımlanabilecek `writeAuditEvent` işlevinin **kullanım örneğidir**; gerçek kayıt fonksiyonunu oluşturmadan bu satırı herhangi bir Controller’a yapıştırmak yeterli olmaz.

```js
await writeAuditEvent({
  type: AUDIT_EVENTS.LOGIN_FAILED,
  actorUserId: user?._id ?? null,
  ip: req.ip,
  userAgent: req.get("user-agent"),
  metadata: {
    reason: user
      ? "INVALID_PASSWORD"
      : "USER_NOT_FOUND",
  },
});
```
