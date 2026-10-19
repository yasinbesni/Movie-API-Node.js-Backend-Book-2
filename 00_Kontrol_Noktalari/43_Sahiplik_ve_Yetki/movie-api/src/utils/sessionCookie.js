import { env } from "../config/env.js";

export const isProduction = env.nodeEnv === "production";

export const sessionCookieName = isProduction
  ? "__Host-sid"
  : "sid";
