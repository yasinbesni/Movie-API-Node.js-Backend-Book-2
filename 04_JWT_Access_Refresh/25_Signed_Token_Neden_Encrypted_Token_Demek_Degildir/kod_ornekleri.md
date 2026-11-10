# Bölüm 25 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# İmzalı Token (Belirteç) Neden Şifrelenmiş Token Değildir?


## Ada'nın E-Postası Token'a Eklenirse Ne Olur?

JWT'nin imzası doğrulandığında, sunucu içeriğin kabul ettiği imzalama anahtarıyla uyumlu olduğunu anlar. **Fakat içeriğe güvenebilmek ile içeriği başkalarından gizlemek farklı konulardır.** Bu ayrımı Ada'nın e-posta adresi üzerinden görelim.

Erişim belirtecinde kullanıcı kimliğinin yanında e-posta adresini de taşıdığımızı düşünelim:

```json
{
  "sub": "66f123...",
  "email": "ada@example.com"
}
```

## Örnek 2

in erişim belirtecindeki `sub` alanı yeterlidir: Bu alan, Ada'nın değişmeyen kullanıcı kimliğini taşır. `iat` ve `exp` gibi oluşturulma ve bitiş zamanları da token'da bulunabilir. Ancak e-posta adresi, parola hash'i, parola sıfırlama anahtarı veya özel profil bilgilerini eklememize gerek yoktur.

Örneğin Ada e-posta adresini değiştirse bile önceden verilmiş token'ın içindeki eski e-posta kendiliğinden güncellenmez. Oysa `sub` aynı kalır. Sunucu kimliği bu alandan öğrenip ihtiyaç duyduğunda MongoDB'den **güncel e-posta adresini** okuyabilir. Böylece token gereksiz kişisel veri taşımaz; değiştirilmiş hesap bilgileriyle de daha kolay çalışırız.

## `HttpOnly` Kullanınca Token Her Yerden Gizlenir mi?

Ada'nın access token'ını `HttpOnly` çerezde taşıdığımızı düşünelim. Bu ayar, sayfadaki JavaScript'in çerez değerini `document.cookie` üzerinden okumasını engeller. Ancak **token'ın sunucuya gönderilmesini engellemez**; zaten korumalı isteği doğrulayabilmemiz için sunucunun ona erişmesi gerekir. Dolayısıyla `HttpOnly`, sunucu günlüklerine yanlışlıkla yazılmış bir token'ı gizleyemez.

Örneğin istekleri incelerken aşağıdaki satırı eklersek Ada'nın gerçek token'ı uygulama günlüğüne düşebilir:

```js
console.log(req.cookies.accessToken);
```
