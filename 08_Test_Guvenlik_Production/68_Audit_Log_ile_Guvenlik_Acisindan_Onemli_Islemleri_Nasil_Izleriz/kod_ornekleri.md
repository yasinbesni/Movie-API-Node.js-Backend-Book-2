# Bölümdeki kod ve istek örnekleri

Bu örnekleri bölümdeki sırayla, **kendi Movie API çalışma kopyanıza** uygulayın. Bazı parçalar var olan bir dosyanın içine eklenir; tek başlarına çalıştırılmaz.

### Örnek 1 — text

```text
sunucu başladı
veritabanına bağlanıldı
bir istek 500 hatası verdi
```

### Örnek 2 — text

```text
login başarılı/başarısız
password reset
refresh token reuse
role değişikliği
account disable
admin resource delete
```

### Örnek 3 — js

```js
const auditEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      index: true,
    },
    actorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    targetType: {
      type: String,
      default: null,
    },
    targetId: {
      type: String,
      default: null,
    },
    ip: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
  },
  { timestamps: true },
);
```

### Örnek 4 — js

```js
export const AUDIT_EVENTS = {
  LOGIN_SUCCESS: "AUTH_LOGIN_SUCCESS",
  LOGIN_FAILED: "AUTH_LOGIN_FAILED",
  REFRESH_REUSE: "AUTH_REFRESH_REUSE_DETECTED",
  PASSWORD_RESET: "AUTH_PASSWORD_RESET",
  ACCOUNT_DISABLED: "ACCOUNT_DISABLED",
  ADMIN_MOVIE_DELETE: "ADMIN_MOVIE_DELETE",
};
```

### Örnek 5 — text

```text
raw password
passwordHash
access token
refresh token
reset token
session id raw değeri
SMTP password
API secret
```

### Örnek 6 — text

```text
E-posta veya parola hatalı.
```

### Örnek 7 — js

```js
await writeAuditEvent({
  type: AUDIT_EVENTS.LOGIN_FAILED,
  actorUserId: user?._id ?? null,
  ip: req.ip,
  userAgent: req.get("user-agent"),
  metadata: {
    reason: user
      ? "INVALID_PASSWORD"
      : "USER_NOT_FOUND",
  },
});
```
