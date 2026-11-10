# Bölüm 23 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

aşımaktır. JWT bu noktada devreye girer: Servis, belirtecin imzasını, süresini ve beklediği doğrulama koşullarını kontrol eder. Koşullar sağlanırsa token'ın `sub` alanından hangi kullanıcı adına düzenlendiğini öğrenebilir. Böyle bir düzende her servis, kullanıcıyı tanımak için mutlaka ortak `sessions` kaydını okumak zorunda kalmayabilir.

Burada değişen, Ada’nın kimliğini korumak için oturum kimliğini yenileme kuralı değil; **isteği karşılayan servisin kullanıcı kimliğini hangi kanıta dayanarak doğruladığıdır.**

## Çalışan Session Sistemini Neden Değiştirmiyoruz?

Çünkü buna mecbur değiliz. Tek bir Express uygulamasında çalışan Movie API için mevcut session düzeni gayet uygun. Üstelik oturumu MongoDB'den silebildiğimiz için çıkış işleminin sunucu tarafındaki etkisini doğrudan yönetebiliyoruz.

JWT'yi **session'ın yerine geçmesi gereken daha güvenli bir sürüm** olarak değil, farklı bir mimari tercih olarak ele alacağız. Mobil istemci eklemek de tek başına JWT'yi zorunlu kılmaz. Önemli olan, istekleri karşılayan servislerin kimliği hangi kaynağa güvenerek doğruladığı ve bu güveni nasıl sürdürdüğüdür.

## Kimlik Bilgisini Nereden Alıyoruz?

İki yöntemin işleyişini yan yana düşünelim:

```text
Session: İstemci → sid → Sunucudaki oturum kaydı → userId
JWT:     İstemci → imzalı token → Doğrulama → sub (kullanıcı kimliği)
```
