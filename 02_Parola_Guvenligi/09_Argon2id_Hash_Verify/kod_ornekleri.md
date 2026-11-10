# Bölüm 9 — Kitaptaki örnekler

Örnekler kitaptaki sırayla verilmiştir. Açıklama ve tasarım karşılaştırmalarını kalıcı uygulama dosyalarıyla karıştırmayın.

## Örnek 1

# Argon2id ile Parola Nasıl Saklanır ve Doğrulanır?

## Eksik Parça Artık Belli

Ada'nın adını ve e-posta adresini kaydedebileceğimiz bir `User` modelimiz var. Kayıt isteğinde hangi alanları kabul edeceğimizi de Joi ile belirledik. Ancak `User` modelindeki `passwordHash` alanı hâlâ boş: Ona yazacağımız güvenli değeri üreten kodu henüz yazmadık.

Önce parolayı güvenli biçimde saklamamızı sağlayacak yardımcı fonksiyonları yazalım. Bunları 10. bölümde `POST /auth/register` isteğine bağlayınca Ada’nın hesabı güvenli bir parola hash’iyle oluşturulacak.

---

## Argon2 Paketini Ekleyelim

5. ve 6. bölümlerde kullanıcı modelini ve kayıt doğrulamasını eklediğimiz **aynı Movie API çalışma kopyasında** devam ediyoruz. `package.json` dosyasının bulunduğu klasörde terminal açalım. Parolayı güvenli biçimde işlemek için yeni bir pakete ihtiyacımız var:

```bash
npm install argon2
```

## Örnek 2

Bu komut `argon2` paketini, üzerinde çalıştığımız Movie API'nin bağımlılıklarına ekler.

Kurulumda hata alırsanız kitabın sonundaki **[Sorun Giderme Rehberi — SG-05](../09_Ekler/01_Sorun_Giderme_Rehberi.md#sg-05)** başlığına bakabilirsiniz.

---

## Parolayla Çalışan Kodun Tek Bir Yeri Olsun

Kayıt sırasında paroladan **Argon2id hash değeri** üreteceğiz. Giriş sırasında ise gönderilen parolayı saklanan bu değere karşı doğrulayacağız. Ada parolasını daha sonra değiştirse de aynı iki işlemi kullanacağız.

Bu iki düşük seviyeli işi `Controller` veya `User` modelinin içine dağıtmak yerine tek dosyada toplayalım:

```text
src/utils/password.js
```

## Örnek 3

Şimdi dosyanın tamamını yazabiliriz:

```js
import argon2 from "argon2";

const HASH_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export const hashPassword = async (password) => {
  return argon2.hash(password, HASH_OPTIONS);
};

export const verifyPassword = async (passwordHash, password) => {
  return argon2.verify(passwordHash, password);
};
```

## Örnek 4

z yere yavaşlatmak değil; **parola tahminini saldırgan için pahalı, gerçek kullanıcı için kabul edilebilir** hâle getirmektir.

`HASH_OPTIONS` yalnızca **yeni bir hash üretirken** `argon2.hash()` fonksiyonuna veriliyor. Üretilen hash metni algoritmayı, kullanılan parametreleri ve salt'ı da içerdiği için `argon2.verify()` doğrulama sırasında bunları saklanan hash'ten okuyabilir. Dolayısıyla `verifyPassword()` içinde seçenekleri ikinci kez yazmıyoruz.

---

## İki Fonksiyon, İki Farklı İş

`hashPassword(password)` ham paroladan saklanacak değeri üretir. Ada kayıt olurken kullanacağız.

`verifyPassword(passwordHash, password)` ise Ada’nın girişte gönderdiği parolanın kayıtlı hash ile uyuşup uyuşmadığını `true` veya `false` olarak bildirir. 11. bölümde giriş kararını bu fonksiyonla oluşturacak, 13. bölümde de çalışan `POST /auth/login` yoluna bağlayacağız. Önce küçük bir denemeyle iki fonksiyonun davranışını görelim.

Parametre sırası önemlidir: `argon2.verify()` önce **saklanan hash'i**, sonra **gönderilen parolayı** alır.

---

## Aynı Parolayı İki Kez Hash'leyelim

Henüz `User.create()` çağırmadan işlemi deneyebiliriz. `src/scripts/tryPasswords.js` adında geçici bir dosya oluşturun:

```js
import {
  hashPassword,
  verifyPassword,
} from "../utils/password.js";

const password = "uzun-bir-deneme-parolasi";

const firstHash = await hashPassword(password);
const secondHash = await hashPassword(password);

console.log("Hash'ler eşit mi?", firstHash === secondHash);
console.log("Doğru parola:", await verifyPassword(firstHash, password));
console.log(
  "Yanlış parola:",
  await verifyPassword(firstHash, "yanlis-deneme-parolasi"),
);
```

## Örnek 5

Çalıştırın:

```bash
node src/scripts/tryPasswords.js
```

## Örnek 6

Beklenen sonuç:

```text
Hash'ler eşit mi? false
Doğru parola: true
Yanlış parola: false
```
