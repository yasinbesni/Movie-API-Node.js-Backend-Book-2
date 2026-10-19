# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — json

```json
{ "message": "Bu adrese ait hesap yok." }
```

### Örnek 2 — http

```http
HTTP/1.1 202 Accepted
```

### Örnek 3 — json

```json
{
  "message": "Adres uygunsa parola yenileme bağlantısı gönderilecektir."
}
```

### Örnek 4 — js

```js
export const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
});
```

### Örnek 5 — http

```http
POST /auth/forgot-password
Content-Type: application/json
```

### Örnek 6 — json

```json
{ "email": "ada@example.com" }
```

### Örnek 7 — text

```text
Hesap yok               → genel yanıt
Hesap var, doğrulanmamış → genel yanıt
Hesap var, doğrulanmış   → genel yanıt + içeride kurtarma süreci
```
