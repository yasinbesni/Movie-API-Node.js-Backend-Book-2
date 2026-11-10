# Bölüm 7 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# Parola Neden Sıradan Bir Kullanıcı Alanı Değildir?

## Ada'nın Yazdığı Bilgiye Kimler Erişebilir?

Ada kayıt formunu doldurdu. Adını ve e-posta adresini neden saklayacağımızı biliyoruz. Parolası da aynı istekle gelecek. İlk bakışta üçü de birer metin gibi görünüyor.

Peki uygulamanın yöneticisi yanlışlıkla veritabanındaki kullanıcı kayıtlarını ekrana yazdırırsa ne olur?

Ad ve e-posta adresi kişisel veridir; erişimi zaten sınırlandırılmalıdır. Ancak **parolanın düz metin olarak görünmesi**, başka bir tehlike yaratır: Hesaba girmek isteyen kişi artık tahmin yürütmek zorunda kalmaz.

Bir de bazı insanların aynı parolayı birden fazla yerde kullandığını düşünelim. Bizim sistemimizdeki bir sızıntı, başka hesapları da tehlikeye atabilir.

Bu nedenle Ada'nın parolasını `name` alanı gibi kaydetmeyeceğiz.

---

## Çalışan Kod Her Zaman Doğru Çözüm Değildir

Şöyle bir kayıt oluşturmak teknik olarak mümkündür:

```js
await User.create({
  name,
  email,
  password,
});
```

## Örnek 2

abanında gerçek parola kalır. Kullanıcı giriş yaptığında da metin karşılaştırmasına dayanan güvensiz bir düzen kurulmuş olur.

Film kayıtlarında bir bilgiyi daha sonra geri okuyabilmek isteriz: *Interstellar* yerine anlaşılmaz bir değer görmek işimize yaramaz. Parola ise farklıdır; doğru parolayı doğrulamak için onun açık metnini geri okumamız gerekmez.

Bir kullanıcının daha sonra doğru parolayı yazıp yazmadığını anlamamız gerekiyor; **eski parolayı yeniden görmemiz gerekmiyor.**

---

## “Veritabanına Kimse Giremez” Varsayımı

Veritabanı erişimini kısıtlayacağız, bağlantıyı koruyacağız, logları dikkatle yöneteceğiz. Yine de iyi bir güvenlik tasarımı şunu da sorar:

> Koruma önlemlerinden biri başarısız olursa zararı nasıl azaltabiliriz?

Veritabanından bir kullanıcı kaydının kopyalandığını düşünelim. Orada gerçek parola yerine doğrudan kullanılamayan bir doğrulama değeri bulunması saldırganın işini zorlaştırır.

**Parola hashleme (password hashing)** bu sorunu çözer. Kayıt sırasında ham parolayı saklamak yerine ondan bir hash değeri üretiriz. Ada giriş yaptığında gönderdiği parola, özel bir doğrulama işlemiyle saklanan hash'e karşı kontrol edilir; parolayı geri açmaya çalışmayız.

```text
Ada kayıt olur
  ↓
Parola, parola hashing işleminden geçer
  ↓
Veritabanında passwordHash saklanır

Ada giriş yapar
  ↓
Gönderdiği parola, saklanan hash'e karşı doğrulanır
  ↓
Eşleşiyor / eşleşmiyor
```
