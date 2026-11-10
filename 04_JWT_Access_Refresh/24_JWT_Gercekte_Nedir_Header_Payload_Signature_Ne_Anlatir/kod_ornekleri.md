# Bölüm 24 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# JWT (JSON Web Token) İçinde Ne Var? Başlık, Veri ve İmza


## Ada'nın Gönderdiği JWT'ye Nasıl Güveniriz?

Movie API, session kullandığında Ada'nın `sid` çerezinden MongoDB'deki oturum kaydına ulaşıyordu. JWT yaklaşımında ise Ada'nın kimliğini belirlemek için sunucunun sakladığı oturum kaydına değil, isteğin taşıdığı imzalı belirtece bakacağız. **Peki belirtecin içindeki `sub` değerini herhangi biri değiştirebiliyorsa sunucu ona neden güvensin?** Yanıtı, JWT'nin başlık, içerik ve imza parçalarının birlikte nasıl çalıştığında bulacağız.

Ama burada önemli bir fark var: Sunucu artık Ada'nın kimliğini bir oturum kaydından okumak yerine **istemcinin getirdiği token'ın içinden** öğrenecek. Öyleyse token'ın içinde `Ada` yazması yeterli mi? Hayır. İstemciden gelen bir metni doğrulamadan kabul edersek, birisi o metindeki kullanıcı kimliğini değiştirip başka bir hesap adına işlem yapmaya çalışabilir.

İmzalı JWT, bu soruna üç parçayı birlikte kullanarak cevap verir. Yaygın **JWS biçiminde** parçalar iki noktayla ayrılır:

```text
header.payload.signature
```

## Örnek 2

 bu bilgiyi okur ama hangi algoritmayı kabul edeceğine kendi güvenlik ayarlarıyla karar verir.
- **İçerik (payload)**, token'ın hangi kullanıcıyı temsil ettiğini (`sub`) ve ne zamana kadar geçerli olduğunu (`exp`) bildirir. Bunlar henüz **doğrulanmış bilgiler değil, token'ın taşıdığı beyanlardır.**
- **İmza (signature)**, başlık ve içeriğin güvenilen imzalama anahtarıyla uyumlu olup olmadığını kontrol etmemizi sağlar. İmza oluşturmak için kullanılan gizli anahtar token'ın içine konulmaz.

Şöyle düşünelim: Birisi Ada'nın token'ındaki `sub` değerini değiştirirse başlık ve içerik artık mevcut imzayla eşleşmez; doğrulama başarısız olur. Token hiç değiştirilmemiş olsa bile `exp` zamanı geçmişse sunucu onu yine reddetmelidir. **İmza kontrolü ile süre kontrolü farklı görevlerdir; güvenilir bir sonuç için ikisi de gerekir.**

![İmzalı JWT'nin başlık, içerik ve imza yapısı](../assets/diagrams/24-jwt-uc-parca.svg)

Başlık ve içerik Base64URL ile kodlanır; bu, verileri **gizlemez**. Token'ı gören biri bu bölümleri okuyabilir. İmza, içeriği saklamaktan ziyade içeriğin değiştirilip değiştirilmediğini denetlemeye yarar.

## Başlık (Header): Hangi İmza Algoritması Belirtiliyor?

Örnek bir başlık:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

## Örnek 3

`alg`, kullanılan imza algoritmasını belirtir. `HS256`, gizli bir anahtarla HMAC-SHA256 imza üretir. `typ` ise isteğe bağlı bir tür bilgisidir. **Neden `HS256`?** Öğrendiğimiz ilk imzalama akışında tek bir Movie API sunucusu hem belirteci üretiyor hem doğruluyor. İki işlemde de aynı gizli anahtarı kullanmak bu küçük yapı için anlaşılır bir başlangıçtır. Farklı sistemlerin yalnızca doğrulama yapmasını istediğimiz bir mimarideyse ortak gizli anahtarı paylaşmak yerine açık/özel anahtar çiftleriyle çalışan algoritmalar daha uygun olabilir.

**Önemli:** Sunucu, token'ın kendi başına bildirdiği algoritmaya koşulsuz güvenmemelidir. Hangi algoritmaların ve anahtarların kabul edileceğini **doğrulama tarafında kendimiz** belirlemeliyiz. Bunu 26. bölümde `verify()` ayarlarıyla yapacağız.

## İçerik (Payload): Kimin İçin Düzenlendi?

Örnek içerik:

```json
{
  "sub": "66f123...",
  "iat": 1760000000,
  "exp": 1760000900
}
```
