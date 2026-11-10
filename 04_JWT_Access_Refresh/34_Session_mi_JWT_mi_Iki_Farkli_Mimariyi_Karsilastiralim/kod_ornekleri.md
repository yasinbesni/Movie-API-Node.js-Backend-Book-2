# Bölüm 34 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

. Session'ın yalnız web'e, JWT'nin yalnız mobile ait olduğu gibi kesin bir ayrım yok.

## Saldırgan Hangi Belirteci Çaldı?

Şimdi iki token'lı JWT yaklaşımının en kritik sorusunu açıkça cevaplayabiliriz: **Parola sorulmadan yenileme yapılması, her access token hırsızının sonsuza kadar içeride kalabileceği anlamına gelmez.** Yalnız access token'ı çalan saldırganın yenileme hakkı yoktur. Ancak refresh token da çalınmışsa, saldırgan süresi ve diğer kontroller elverdiği sürece yeni erişim belirteci almayı deneyebilir.

Rotation, aynı refresh token'ın iki kez başarıyla kullanılmasını engelleyip yeniden kullanımı fark etmemize yardımcı olur; **ilk kötüye kullanımı ya da daha önce verilmiş kısa ömürlü access token'ları otomatik olarak durdurmaz.** Bu yüzden iptal, hesap durumu, güvenli taşıma ve gerektiğinde ek korumalar, sistemin tamamını oluşturur.

## Ada'nın Aynı Sorununa İki Ayrı Çözüm

Ada'nın Movie API'ye giriş yaptıktan sonra yeniden tanınması gerekiyor. Bunu önce **session (sunucuda tutulan oturum)** yöntemiyle çözdük. Ardından imzalı erişim JWT'si ve veritabanında izlenen yenileme belirteçlerini kurduk. İki yöntemi de gördük; şimdi hangisini neden seçebileceğimizi konuşabiliriz.

```text
Oturum yöntemi:
çerez → oturum kimliği → sunucudaki oturum kaydı → kullanıcı

JWT + yenileme yöntemi:
erişim JWT'si → imza ve süre doğrulaması → kullanıcı kimliği
yenileme belirteci → veritabanındaki kayıt → yenileme / iptal
```
