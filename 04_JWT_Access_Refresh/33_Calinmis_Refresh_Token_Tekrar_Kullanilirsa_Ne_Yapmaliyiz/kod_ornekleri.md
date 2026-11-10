# Bölüm 33 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

saldırganın istemcisine gönderebilir.** Çünkü R1'in Ada'nın hesabıyla ilişkili olması, isteğin Ada'nın cihazından geldiğini kanıtlamaz.

Ada daha sonra kendi R1'iyle yenilemek istediğinde sunucu aynı belirtecin daha önce kullanıldığını fark eder. İşte şüpheli tekrar bu noktada görünür olur.

Şimdi ne yapmalıyız? Yalnızca R1'i reddetmek yeterli değildir: **Saldırgan R2'yi zaten almış olabilir.** Bu yüzden aynı girişten üretilen sonraki yenileme belirteçlerini de iptal etmeyi seçebiliriz. Böylece R2 ile yeni access token alınmasının önünü kesmeye çalışırız. Ancak saldırgana daha önce verilmiş A2, ayrıca bir iptal denetimi yoksa süresi dolana kadar çalışabilir.

Ada da bu karardan etkilenir; geçerli yenileme hakkı kalmadığında yeniden giriş yapması gerekir. Üstelik Ada bir daha yenileme isteği göndermezse, R1'in ikinci kez kullanıldığı hiç görülmeyebilir. **Rotation saldırıyı kesin olarak önlemez; eski belirteç yeniden kullanıldığında şüpheli durumu tespit etmemizi sağlar.**

## Ada R1'i Önce Kullanırsa

Bu kez Ada yenileme işlemini tamamlamış ve R2'yi almıştır. Saldırgan eski R1'i daha sonra gönderdiğinde sunucu aynı değerin önceden kullanıldığını görür ve yenileme isteğini reddeder.

```text
Ada:       R1 ──► R2
Başka istek: R1 ──► daha önce kullanılmış
```

## Örnek 2

Bu olay da şüphelidir; fakat yine kesin saldırı kanıtı değildir. Ağın aynı isteği yeniden göndermesi veya istemcinin iki yenileme isteğini aynı anda başlatması benzer sonuç doğurabilir. Bu nedenle güvenlik tepkisi tasarlarken hem çalınmış belirteç riskini hem de Ada'nın gereksiz yere oturum dışına çıkarılma ihtimalini hesaba katmalıyız.

## Eski R1 Yüzünden R2'yi Nasıl İptal Ederiz?

R1, R2 ve ileride üretilebilecek R3 birbirinden farklı değerlerdir. Ama **aynı girişle başlayan bir yenileme zincirinin** parçalarıdır. `familyId` alanı bu kayıtların ortak kimliğidir: Yeni belirteç oluşturulurken önceki kayıttaki `familyId` aktarılır.

Böylece sunucu R1'in yeniden kullanıldığını gördüğünde yalnız R1'i değil, **aynı `familyId` değerini taşıyan ve henüz iptal edilmemiş kayıtları** da bulabilir. Ada'nın telefonunda ayrı bir girişle başlatılmış yenileme zinciri varsa onun farklı `familyId` değeri bulunur; bu karardan otomatik olarak etkilenmez.

```text
R1 yeniden sunuldu
        ↓
R1'in familyId değeri bulundu
        ↓
Aynı kimliğe bağlı yenileme kayıtları iptal edildi
        ↓
Bu kayıtlarla artık yeni access token alınamaz
```

## Örnek 3

Bu iptal işlemi **daha önce üretilmiş access token'ları kendiliğinden geçersiz kılmaz.** Onların erken iptali için ayrı bir kontrol gerekir.

## İptal İşlemini Koda Ekleyelim

`src/services/auth.js` dosyasına şu fonksiyonu ekliyoruz:

```js
export const revokeTokenFamily = async (familyId) => {
  await RefreshToken.updateMany(
    { familyId, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
};
```

## Örnek 4

Fonksiyonun adı `revokeTokenFamily` olsa da yaptığı iş nettir: **Verilen `familyId` ile ilişkili, henüz iptal edilmemiş kayıtların `revokedAt` alanına iptal zamanını yazar.** Böylece kayıtlar MongoDB'de durmaya devam eder, fakat yenileme için kabul edilmez.

Ardından `rotateRefreshToken()` fonksiyonunda koşullu `findOneAndUpdate()` sonuç vermediğinde çalışan bloğu değiştiriyoruz:

Aşağıdaki koşul, `src/services/auth.js` içindeki mevcut `rotateRefreshToken()` fonksiyonunun `if (!previous)` bölümünde **değiştirilecek parçadır**; ikinci bir fonksiyon oluşturmayın.

```js
if (!previous) {
  const knownToken = await RefreshToken.findOne({ tokenHash });

  if (knownToken?.usedAt && !knownToken.revokedAt) {
    await revokeTokenFamily(knownToken.familyId);
    // Güvenlik olayını burada ham token olmadan kaydedebiliriz.
  }

  throwUnauthorized();
}
```
