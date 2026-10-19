# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — http

```http
POST /auth/register
Content-Type: application/json
```

### Örnek 2 — json

```json
{
  "name": "Ada",
  "email": "ADA@EXAMPLE.COM",
  "password": "uzun-bir-deneme-parolasi"
}
```

### Örnek 3 — json

```json
{
  "name": "Ada",
  "email": "ada@example.com",
  "password": "uzun-bir-deneme-parolasi",
  "role": "admin"
}
```

### Örnek 4 — text

```text
Kayıt isteğinde:          Veritabanındaki User kaydında:
name                      name
email                     email
password                  passwordHash
                          createdAt
                          updatedAt
```

### Örnek 5 — text

```text
src/validation/auth.js
```

### Örnek 6 — js

```js
import Joi from "joi";

export const registerUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(15).max(128).required(),
});
```

### Örnek 7 — text

```text
1 büyük harf + 1 rakam + 1 özel karakter
```

### Örnek 8 — js

```js
const { error, value } = schema.validate(req.body, {
  abortEarly: false,
});
```

### Örnek 9 — json

```json
{
  "name": "Ada",
  "email": "ADA@EXAMPLE.COM",
  "password": "uzun-bir-deneme-parolasi"
}
```

### Örnek 10 — json

```json
{
  "name": "A",
  "email": "yanlis",
  "password": "123"
}
```

### Örnek 11 — json

```json
{
  "name": "Ada",
  "email": "ada@example.com",
  "password": "uzun-bir-deneme-parolasi",
  "role": "admin"
}
```
