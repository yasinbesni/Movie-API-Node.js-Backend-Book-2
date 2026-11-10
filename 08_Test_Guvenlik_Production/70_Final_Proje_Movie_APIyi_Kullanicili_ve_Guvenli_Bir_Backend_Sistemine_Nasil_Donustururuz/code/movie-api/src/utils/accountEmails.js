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
