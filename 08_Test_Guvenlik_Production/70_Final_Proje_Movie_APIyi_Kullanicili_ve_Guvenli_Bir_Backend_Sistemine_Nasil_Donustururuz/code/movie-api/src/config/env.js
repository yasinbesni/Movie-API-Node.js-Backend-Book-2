import "dotenv/config";
const required = name => { const value = process.env[name]?.trim(); if (!value) throw new Error(`${name} zorunludur.`); return value; };
const positive = (name, fallback, max = Number.MAX_SAFE_INTEGER) => { const n = Number(process.env[name] ?? fallback); if (!Number.isSafeInteger(n) || n < 1 || n > max) throw new Error(`${name} geçersiz.`); return n; };
const secret = name => { const value = required(name); if (value.length < 32 || /CHANGE_ME|ornek|degistir/i.test(value)) throw new Error(`${name} için en az 32 karakterlik bağımsız rastgele değer üretin.`); return value; };
const url = name => { const value = required(name); const parsed = new URL(value); if (!["http:","https:"].includes(parsed.protocol)) throw new Error(`${name} HTTP(S) olmalıdır.`); return value; };
export const env = {
 nodeEnv: process.env.NODE_ENV ?? "development", mongodbUrl: required("MONGODB_URL"),
 port: positive("PORT",3000,65535), corsOrigin: url("CORS_ORIGIN"), appBaseUrl: url("APP_BASE_URL"),
 sessionSecret: secret("SESSION_SECRET"), jwtAccessSecret: secret("JWT_ACCESS_SECRET"), csrfSecret: secret("CSRF_SECRET"),
 rateLimitWindowMs: positive("RATE_LIMIT_WINDOW_MS",60000), rateLimitLimit: positive("RATE_LIMIT_LIMIT",100),
 logLevel: process.env.LOG_LEVEL ?? "info", trustProxy: process.env.TRUST_PROXY === "1" ? 1 : false,
 smtpHost: process.env.SMTP_HOST?.trim(), smtpPort: positive("SMTP_PORT",1025,65535),
 smtpUser: process.env.SMTP_USER?.trim(), smtpPass: process.env.SMTP_PASS,
 emailFrom: process.env.EMAIL_FROM ?? "no-reply@example.com", supportEmailTo: process.env.SUPPORT_EMAIL_TO?.trim() || null,
 avatarStorage: process.env.AVATAR_STORAGE ?? "local",
 cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME, cloudinaryApiKey: process.env.CLOUDINARY_API_KEY, cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
};
if (!["local","cloudinary"].includes(env.avatarStorage)) throw new Error("AVATAR_STORAGE local veya cloudinary olmalı.");
if (env.avatarStorage === "cloudinary") for (const name of ["CLOUDINARY_CLOUD_NAME","CLOUDINARY_API_KEY","CLOUDINARY_API_SECRET"]) required(name);
if (!["fatal","error","warn","info","debug","trace","silent"].includes(env.logLevel)) throw new Error("LOG_LEVEL geçersiz.");
if (env.nodeEnv === "production" && (!env.corsOrigin.startsWith("https://") || !env.appBaseUrl.startsWith("https://"))) throw new Error("Production adresleri HTTPS olmalıdır.");
