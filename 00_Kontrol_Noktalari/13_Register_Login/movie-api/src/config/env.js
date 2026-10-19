import "dotenv/config";

const getRequiredString = (name) => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `${name} environment variable zorunludur.`,
    );
  }

  return value;
};

const parsePort = (value) => {
  if (value === undefined) {
    return 3000;
  }

  const port = Number(value);

  if (
    !Number.isSafeInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    throw new Error(
      "PORT 1 ile 65535 arasında tam sayı olmalıdır.",
    );
  }

  return port;
};

const parsePositiveInteger = (
  name,
  value,
  defaultValue,
) => {
  if (value === undefined) {
    return defaultValue;
  }

  const number = Number(value);

  if (
    !Number.isSafeInteger(number) ||
    number < 1
  ) {
    throw new Error(
      `${name} pozitif tam sayı olmalıdır.`,
    );
  }

  return number;
};

const LOG_LEVELS = [
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "silent",
];

const parseLogLevel = (value) => {
  const logLevel =
    (value ?? "info")
      .trim()
      .toLowerCase();

  if (!LOG_LEVELS.includes(logLevel)) {
    throw new Error(
      "LOG_LEVEL geçerli bir log seviyesi olmalıdır.",
    );
  }

  return logLevel;
};

export const env = {
  mongodbUrl: getRequiredString(
    "MONGODB_URL",
  ),
  port: parsePort(process.env.PORT),
  corsOrigin: getRequiredString(
    "CORS_ORIGIN",
  ),
  rateLimitWindowMs: parsePositiveInteger(
    "RATE_LIMIT_WINDOW_MS",
    process.env.RATE_LIMIT_WINDOW_MS,
    60_000,
  ),
  rateLimitLimit: parsePositiveInteger(
    "RATE_LIMIT_LIMIT",
    process.env.RATE_LIMIT_LIMIT,
    100,
  ),
  logLevel: parseLogLevel(
    process.env.LOG_LEVEL,
  ),
};
