import { env } from "../config/env.js";

const isProduction = env.nodeEnv === "production";

const baseOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
};

export const accessCookieOptions = {
  ...baseOptions,
  path: "/",
  maxAge: 15 * 60 * 1000,
};

export const refreshCookieOptions = {
  ...baseOptions,
  path: "/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const setAuthCookies = (
  res,
  accessToken,
  refreshToken,
) => {
  res.cookie("accessToken", accessToken, accessCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);
};

export const clearAuthCookies = (res) => {
  const { maxAge: _a, ...accessClear } = accessCookieOptions;
  const { maxAge: _r, ...refreshClear } = refreshCookieOptions;

  res.clearCookie("accessToken", accessClear);
  res.clearCookie("refreshToken", refreshClear);
};
