# Bölümün kaynak metnindeki kod ve istek örnekleri

Bu dosya, ilgili bölümdeki örnekleri **orijinal sıralarıyla** gösterir. Bazı bloklar tek başına çalıştırılacak dosya değil, mevcut dosyaya eklenecek parçalardır. Bunları `code/` klasöründeki tam örneklerle karıştırmayın.

### Örnek 1 — text

```text
Router → Controller → Auth Service → E-posta Service → SMTP sağlayıcısı
                              ↘ MongoDB
```

### Örnek 2 — bash

```bash
npm install nodemailer
```

### Örnek 3 — dotenv

```dotenv
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=ornek-kullanici
SMTP_PASS=ornek-sifre
EMAIL_FROM=no-reply@example.com
APP_BASE_URL=http://localhost:5173
```

### Örnek 4 — js

```js
smtpHost: getRequiredString("SMTP_HOST"),
smtpPort: parsePositiveInteger("SMTP_PORT", process.env.SMTP_PORT, 587),
smtpUser: getRequiredString("SMTP_USER"),
smtpPass: getRequiredString("SMTP_PASS"),
emailFrom: getRequiredString("EMAIL_FROM"),
appBaseUrl: getRequiredString("APP_BASE_URL"),
```

### Örnek 5 — js

```js
if (env.smtpPort > 65535) {
  throw new Error("SMTP_PORT geçersiz.");
}
const appUrl = new URL(env.appBaseUrl);
if (!["http:", "https:"].includes(appUrl.protocol)) {
  throw new Error("APP_BASE_URL HTTP(S) adresi olmalı.");
}
```

### Örnek 6 — js

```js
import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpPort === 465,
  auth: { user: env.smtpUser, pass: env.smtpPass },
});

export const sendEmail = ({ to, subject, text, html }) =>
  transporter.sendMail({
    from: env.emailFrom,
    to,
    subject,
    text,
    html,
  });
```

### Örnek 7 — js

```js
import { env } from "../config/env.js";

const makeLink = (path, token) => {
  const url = new URL(path, env.appBaseUrl);
  url.searchParams.set("token", token);
  return url.toString();
};

export const verificationLink = (token) =>
  makeLink("/verify-email", token);

export const passwordResetLink = (token) =>
  makeLink("/reset-password", token);
```

### Örnek 8 — js

```js
export const sendVerificationEmail = (to, rawToken) =>
  sendEmail({
    to,
    subject: "E-posta adresini doğrula",
    text: `Adresini doğrulamak için: ${verificationLink(rawToken)}`,
  });

export const sendPasswordResetEmail = (to, rawToken) =>
  sendEmail({
    to,
    subject: "Parolanı yenile",
    text: `Yeni parola belirlemek için: ${passwordResetLink(rawToken)}`,
  });
```

### Örnek 9 — js

```js
export const requestPasswordReset = async (email) => {
  const user = await User.findOne({
    email,
    isEmailVerified: true,
  });
  if (!user) return;

  const rawToken = await issuePasswordResetToken(user._id);
  try {
    await sendPasswordResetEmail(user.email, rawToken);
  } catch {
    await AccountToken.updateOne(
      { tokenHash: hashToken(rawToken), usedAt: null },
      { $set: { usedAt: new Date() } },
    );
    // Hesap varlığını SMTP hatasıyla da açığa çıkarmıyoruz.
  }
};
```

### Örnek 10 — js

```js
export const forgotPasswordController = async (req, res) => {
  await requestPasswordReset(req.body.email);
  res.status(202).json({
    message: "Adres uygunsa parola yenileme bağlantısı gönderilecektir.",
  });
};
```

### Örnek 11 — js

```js
export const requestEmailVerification = async (user) => {
  if (user.isEmailVerified) return;
  const rawToken = await issueEmailVerificationToken(user._id);
  try {
    await sendVerificationEmail(user.email, rawToken);
  } catch (error) {
    await AccountToken.updateOne(
      { tokenHash: hashToken(rawToken), usedAt: null },
      { $set: { usedAt: new Date() } },
    );
    throw error;
  }
};
```

### Örnek 12 — js

```js
export const sendVerificationController = async (req, res) => {
  await requestEmailVerification(req.user);
  res.status(202).json({ message: "Doğrulama isteği alındı." });
};
```

### Örnek 13 — js

```js
router.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  forgotPasswordController,
);
router.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  resetPasswordController,
);
router.post(
  "/send-verification-email",
  authenticate,
  sendVerificationController,
);
```
