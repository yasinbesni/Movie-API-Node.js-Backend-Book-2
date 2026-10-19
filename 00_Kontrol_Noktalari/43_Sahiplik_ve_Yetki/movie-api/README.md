# Movie API

Node.js, Express, MongoDB ve Mongoose ile geliştirilen REST API projesi.

## Kullanılan Teknolojiler

- Node.js
- Express
- MongoDB / Mongoose
- Joi
- CORS
- Helmet
- express-rate-limit
- Pino / pino-http
- OpenAPI / Swagger UI

## Kurulum

```bash
npm install
```

`.env.example` dosyasını referans alarak kendi `.env` dosyanızı oluşturun.

Gerekli ayarlar:

```env
MONGODB_URL=...
PORT=3000
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_LIMIT=100
LOG_LEVEL=info
```

## Çalıştırma

```bash
npm start
```

## Temel Endpoint'ler

```text
GET    /movies
GET    /movies/:movieId
POST   /movies
PATCH  /movies/:movieId
DELETE /movies/:movieId
```

Operasyonel ve dokümantasyon endpoint'leri:

```text
GET /health
GET /docs
```

## API Documentation

Server çalışırken Swagger UI:

```text
http://localhost:3000/docs
```

## Postman Tests

67. bölümde oluşturulan Movie API Collection'ını `Local` veya `Production` Environment ile çalıştırabilirsiniz.

## Live URL

Deployment sonrasında canlı URL'nizi buraya ekleyin.
