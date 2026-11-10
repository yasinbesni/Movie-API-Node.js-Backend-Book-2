# Bölüm 15 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# Cookie (Çerez) Nedir ve Tarayıcı Onu İsteğe Nasıl Ekler?

## Ada'nın Tarayıcısı Giriş Bilgisini Nerede Tutacak?

Ada'nın girişini başarıyla doğruladık. Artık kişisel listesini açtığında parolasını yeniden yazmasını istemiyoruz. Bunun için sunucuda bir oturum kaydı tutmayı, tarayıcıda da bu kayda ait kimliği taşımayı düşündük.

Şimdi vestiyer fişinin tarayıcıdaki karşılığına bakalım. **Cookie (çerez)**, tarayıcının bir site için sakladığı küçük bir ad–değer bilgisidir. Sunucu hangi bilgiyi hangi koşullarda saklayacağını bildirir; tarayıcı da koşullar uygunsa bu bilgiyi sonraki isteğe kendisi ekler.

Çerez yalnızca giriş işlemlerinde kullanılmaz. Fakat Movie API'de onu özellikle **oturum kimliğini taşımak** için kullanacağız. Önce tarayıcıyla sunucunun birbirine ne gönderdiğini görelim.

## İlk İstekte `Set-Cookie`, Sonraki İstekte `Cookie`

Ada giriş yaptığında sunucumuzun bir oturum oluşturduğunu **varsayalım**. Bu mekanizmayı gerçek koda 17. bölümde ekleyeceğiz; aşağıdaki örnek, o sırada göreceğimiz HTTP iletişimini anlamak için.

Sunucu başarılı girişin **yanıtına** şu başlığı ekler:

```http
Set-Cookie: sid=ornekOturumDegeri; Path=/; HttpOnly; SameSite=Lax
```

## Örnek 2

Bu satırı parçalarına ayıralım:

- **`Set-Cookie`**: Sunucunun tarayıcıya gönderdiği **yanıt başlığı**. “Bu çerezi belirtilen kurallarla sakla” anlamına gelir.
- **`sid`**: Çerezin adı. Movie API'nin oturum kimliğini bu adla tanıyacağız.
- **`ornekOturumDegeri`**: Öğrenmek için yazdığımız temsili değer. Gerçekte oturum kimliği tahmin edilmesi güç ve rastgele olmalı.
- **`Path=/`**: Çerezin aynı sunucuda hangi URL yollarına gönderilebileceğinin sınırını belirler. `/` bu sunucunun alt yollarını kapsar.
- **`HttpOnly`**: Sayfanın JavaScript kodunun çerezin değerini doğrudan okumasını engeller.
- **`SameSite=Lax`**: Başka sitelerden başlatılan isteklerde çerezin hangi koşullarda gönderilebileceğini sınırlar.

Tarayıcı bu yanıtı aldığında ve kurallar uygunsa `sid` çerezini saklar. Ada daha sonra Movie API'ye uygun bir istek gönderdiğinde tarayıcı isteğe şunu ekler:

```http
Cookie: sid=ornekOturumDegeri
```

## Örnek 3

İki satır arasındaki en önemli farkı görebiliriz: **`Set-Cookie` sunucudan tarayıcıya, `Cookie` tarayıcıdan sunucuya gider.** İkinci satırda `HttpOnly`, `Path` veya `SameSite` yoktur; çünkü bunlar çerezin değerinin bir parçası değil, tarayıcının onu nasıl kullanacağını belirleyen kurallardır.

![Sunucunun Set-Cookie yanıtı ve tarayıcının sonraki Cookie isteği](../assets/diagrams/15-cookie-istek-yanit-akisi.svg)

Bunu Ada'nın iki isteğine uygularsak:

```text
Ada giriş yapar
  → Sunucu yanıtla Set-Cookie gönderir
  → Tarayıcı sid değerini saklar

Ada kişisel listesini açar
  → Tarayıcı uygun isteğe Cookie başlığını ekler
  → Sunucu sid değerinin geçerli bir oturum kaydı olup olmadığına bakar
```

## Örnek 4

da kuralların neyi değiştirdiğini somutlaştıralım:

- **`Path=/` — URL yolu:** Çerezin ait olduğu sunucuda `/movies` gibi bir yola da `/auth/login` gibi bir yola da gönderilmesine izin verir. **Başka bir siteye gönderme izni vermez.**
- **`HttpOnly` — JavaScript'in erişimi:** Sayfanın JavaScript'i çerezi `document.cookie` üzerinden okuyamaz. Bu, çerezin çalınma yollarından birini sınırlar; bütün saldırıları engellemez.
- **`SameSite=Lax` — İsteği başlatan site:** Başka bir sitenin Movie API'ye arka planda gönderdiği birçok istekte çerezin gönderilmesini engeller. Ada'nın tıkladığı normal bir bağlantıyla yapılan üst düzey gezinme farklı değerlendirilebilir.

**Neden üç ayrı kural var?** Çünkü `Path` çerezin hangi URL yollarına gidebileceğini, `HttpOnly` sayfa kodunun onu okuyup okuyamayacağını, `SameSite` ise başka bir sitenin başlattığı isteklerde nasıl davranacağını belirler. Ada'nın kimliğini tek bir ayarla koruyamayız. Üstelik henüz bağlantının güvenliğini belirlemedik: Sunucuda oturumu çalıştırdıktan sonra bu soruya da döneceğiz.

## `HttpOnly` Varken Tarayıcı Çerezi Nasıl Gönderebiliyor?

“JavaScript okuyamıyorsa istek başlığına kim ekliyor?” sorusu çok doğal. İkisi farklı iş:

```text
Sayfadaki JavaScript cookie değerini okuyamaz.

Tarayıcı uygun HTTP isteğine cookie'yi yine ekleyebilir.
```
