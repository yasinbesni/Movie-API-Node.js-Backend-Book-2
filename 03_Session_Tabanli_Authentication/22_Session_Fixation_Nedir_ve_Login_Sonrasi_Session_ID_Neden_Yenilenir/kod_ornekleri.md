# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — text

```text
Girişten önce:  sid=ESKI  → anonim oturum
Girişten sonra: sid=ESKI  → Ada'nın oturumu   (riskli)

İstediğimiz:
Girişten sonra: sid=YENI  → Ada'nın oturumu
```

### Örnek 2 — js

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

### Örnek 3 — js

```js
app.get("/debug/anonymous-session", (req, res) => {
  req.session.visitedBeforeLogin = true;
  return res.status(200).json({ message: "Hazır." });
});
```
