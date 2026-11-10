# Bölüm 39 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

yor. Rol kontrolümüz çalışıyor.

Şimdi daha önemli bir soru var: **Deniz'in yönetici olması, Ada'ya ait her bilginin Deniz'e açık olduğu anlamına mı gelir?**

Hayır. Yönetici rolü, yalnızca uygulamanın açıkça tanımladığı yönetim görevleri için kullanılmalı. Aksi hâlde tek bir kontrol bütün kullanıcı verilerinin önündeki kapıyı açabilir.

## Aynı Uygulamada Farklı Kurallar

Movie API'de şu ayrımı düşünelim:

| İşlem | Kim yapabilmeli? |
|---|---|
| Herkese açık film kataloğunu görüntüleme | Herkes |
| Film kataloğunu yönetme | Yetkili yönetici |
| Ada'nın kendi hesap bilgilerini görüntüleme | Ada |
| Ada'nın ileride oluşturacağı özel listesini düzenleme | Ada |
| Moderasyon için içerik gizleme | Bu görev verilmiş yönetici |

Son iki özelliği **henüz kodlamadık**; tablo bir erişim politikası taslağı. Yönetim yetkisinin sınırsız olmadığını göstermek için kullanıyoruz.

## En Az Yetki İlkesi

Güvenlikte *least privilege* (en az yetki) ilkesi, her hesaba yalnızca yaptığı iş için gerekli erişimi vermeyi söyler.

Örneğin Deniz'in film kataloğundaki hatalı bir başlığı düzeltmesi gerekebilir. Bu görev, Ada'nın gizli hesap bilgilerini okumasını gerektirmez.

Bu nedenle tek bir genel kontrol:

```js
requireRole("admin")
```
