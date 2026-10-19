# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — text

```text
Ada:       R1 ──► R2
Başka istek: R1 ──► daha önce kullanılmış
```

### Örnek 2 — text

```text
Kullanılmış R1 tekrar gelirse
    ↓
R1'in ait olduğu aileyi kapat
    ↓
Bu aileyle yeni yenileme yapma
```

### Örnek 3 — js

```js
export const revokeTokenFamily = async (familyId) => {
  await RefreshToken.updateMany(
    { familyId, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
};
```

### Örnek 4 — js

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
