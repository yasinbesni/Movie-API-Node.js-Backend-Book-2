# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — json

```json
{
  "_id": "...",
  "name": "Ada",
  "email": "ada@example.com",
  "passwordHash": "$argon2id$..."
}
```

### Örnek 2 — json

```json
{
  "email": "ADA@EXAMPLE.COM",
  "password": "uzun-bir-deneme-parolasi"
}
```

### Örnek 3 — js

```js
const user = await User.findOne({ email });
```

### Örnek 4 — js

```js
passwordHash: {
  type: String,
  required: true,
  select: false,
},
```

### Örnek 5 — js

```js
const user = await User.findOne({ email })
  .select("+passwordHash");
```

### Örnek 6 — js

```js
const isPasswordValid = await verifyPassword(
  user.passwordHash,
  password,
);
```

### Örnek 7 — text

```text
Hesap bulundu + parola doğru → kimlik doğrulandı
Hesap bulunamadı veya parola yanlış → giriş başarısız
```

### Örnek 8 — js

```js
const publicUser = {
  id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
};
```

### Örnek 9 — js

```js
export const loginUserSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});
```

### Örnek 10 — text

```text
E-posta aynı biçime getirilir
            ↓
User bulunur (hash yalnızca burada istenir)
            ↓
Gönderilen parola Argon2 ile doğrulanır
            ↓
        Başarılı mı?
```
