# Bölümdeki kod ve istek örnekleri

Bu örnekleri bölümdeki sırayla, **kendi Movie API çalışma kopyanıza** uygulayın. Bazı parçalar var olan bir dosyanın içine eklenir; tek başlarına çalıştırılmaz.

### Örnek 1 — http

```http
GET /movies
```

### Örnek 2 — text

```text
Ada'nın listesi       → Interstellar var
Deniz'in listesi      → Interstellar yok
```

### Örnek 3 — http

```http
POST /movies
Content-Type: application/json
```

### Örnek 4 — json

```json
{
  "title": "Interstellar",
  "releaseYear": 2014,
  "voteAverage": 8.7
}
```

### Örnek 5 — text

```text
Request geldi
     ↓
Hangi işlem isteniyor?       → biliyoruz
Hangi veri gönderilmiş?      → biliyoruz
Bu işlem hangi hesaba ait?   → henüz bilmiyoruz
```

### Örnek 6 — json

```json
{
  "name": "Ada",
  "email": "ada@example.com"
}
```

### Örnek 7 — http

```http
DELETE /movies/66f123456789abcdef123456
```

### Örnek 8 — text

```text
Bu isteği hangi hesap gönderiyor?
                   ↓
Bu hesap istenen işlemi yapabilir mi?
```

### Örnek 9 — text

```text
Router → Controller → Service → Model → MongoDB
```

### Örnek 10 — text

```text
Ada   → İzleyeceklerim: Interstellar
Deniz → İzleyeceklerim: (boş)
```
