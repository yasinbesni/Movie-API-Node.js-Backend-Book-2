# Bölüm 8 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# Hashleme ve Şifreleme: Parolayı Nasıl Koruyacağız?

## Ada'nın Parolasını Nasıl Saklayacağız?

Ada kayıt formunda parolasını gönderdi. Yarın tekrar giriş yaptığında aynı parolayı yazacak. Sunucumuzun bunu doğrulayabilmesi için bugün gönderdiği parolayı **olduğu gibi saklaması** gerekiyor mu?

Hayır. Parolayı geri okumamıza gerek yok; sonraki girişte Ada’nın gönderdiği parolanın doğru olup olmadığını anlayabilmemiz yeterli. Bunun için farklı amaçlarla kullanılan iki işlemi ayırmalıyız: **şifreleme (encryption)** ve **hashleme (hashing)**. Hash, bir metnin kısaltılmış özeti değildir; bir girdiden matematiksel bir işlemle üretilen değerdir. Parola saklarken bu işi, parola doğrulamak için tasarlanmış **Argon2id** ile yapacağız.

---

## Şifreleme (Encryption): Geri Açılabilen Veri

Bazı verileri daha sonra özgün hâliyle kullanmak zorundayız. Örneğin bir dış servisle bağlantı kurarken şifrelenmiş sakladığımız bir sırrı, yetkili işlem sırasında geri açmamız gerekebilir.

```text
veri + gizli anahtar
        ↓
    şifreli veri
        ↓
aynı veya ilişkili anahtarla çözme
        ↓
    özgün veri
```

## Örnek 2

Bu, uygun biçimde kullanılan **encryption** yaklaşımıdır. Geri açma anahtarının korunması kritik önemdedir.

Ada'nın parolasında ise durum başka. Uygulamanın parolanın kendisini bir daha görmesine ihtiyaç yok. Gereken tek şey, giriş sırasında verilen parolanın doğru olup olmadığını anlayabilmek.

---

## Hashleme (Hashing): Geri Açmak Yerine Doğrulamak

Kayıt olurken paroladan bir hash üretiriz. Girişte parola yeniden gönderildiğinde, kütüphanenin doğrulama işlevi bu girdiyi **saklanan hash'e göre** sınar.

```text
Kayıt:   parola ──► Argon2id ──► passwordHash
                                  │
Giriş:   parola ─────► verify ◄───┘
                         │
                   doğru / yanlış
```

## Örnek 3

`passwordHash` şifrelenmiş bir parola değildir; “anahtarı bulup açacağımız” bir kutu gibi düşünmemeliyiz.

Peki aynı parolayı kullanan iki kişi neden her zaman aynı hash'e sahip olmamalı?

---

## Salt (Rastgele Ek Değer): Aynı Parolanın Aynı İz Bırakmaması

Diyelim ki Ada ve Deniz tesadüfen aynı parolayı seçti. İkisinin hesap kayıtlarında aynı hash'in görünmesi, veritabanını inceleyen saldırgana bu eşitliği belli eder.

Parola hashing algoritması her hesap için yeni bir **rastgele salt** kullanır. Ada ile Deniz aynı parolayı seçse bile farklı salt'lar sayesinde veritabanındaki hash metinleri aynı görünmez. Bu, saldırganın yalnızca hash değerlerine bakıp iki kişinin parolasının eşit olduğunu anlamasını zorlaştırır; **parola tahmini yapılmasını tümüyle engellemez**.

Salt (her parola için kullanılan rastgele ek değer) gizli olmak zorunda değildir. Modern parola hashing kütüphaneleri genellikle salt'ı güvenli biçimde üretir ve doğrulamada gerekli bilgileri saklanan hash'in içinde taşır. Bizim yapacağımız şey sabit bir salt yazmak değil, güvenilir kütüphanenin bu işini doğru kullanmak.

```text
aynı parola + salt A  → hash A
aynı parola + salt B  → hash B
```

## Örnek 4

Bu yüzden giriş sırasında yeni hash üretip eski hash ile düz metin karşılaştırması yapmayacağız. **`verify` kullanacağız.**

---

## Pepper (Ayrı Tutulan Gizli Değer): Ek Bir Koruma Katmanı

**Pepper**, hash'e ek koruma sağlamak için kullanılan ve veritabanından ayrı saklanması gereken gizli bir değerdir. **Salt rastgeledir ve gizli olmak zorunda değildir; pepper ise gizli kalmalıdır.** Movie API'de pepper eklemiyoruz: Yeni bir gizli değeri koruma ve gerektiğinde değiştirme sorumluluğunu üstlenmeden önce Argon2id ile güvenli temel akışı kuruyoruz. Bu tercih, pepper'ın yararsız olduğu anlamına gelmez.

---

## Neden Argon2id?

Saldırganın çaldığı hash'ler üzerinde çok sayıda tahmin yapmasını zorlaştırmak için parola hashing işleminin belirli bir hesaplama ve bellek maliyeti olmalıdır. Argon2id bu amaçla kullanılan modern yöntemlerden biridir.

Bu maliyetin aşırı yükseltilmesi de sorunsuz değildir; normal girişlerde sunucu kaynakları tüketilir. Dolayısıyla parametreleri deneyeceğimiz makinenin kapasitesine ve güncel güvenlik önerilerine göre seçmeliyiz.

Ada'nın kaydında artık neyi saklayacağımız açık:

```text
name          → Ada
email         → ada@example.com
passwordHash  → Argon2id ile üretilen değer
```
