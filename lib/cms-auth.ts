import { timingSafeEqual } from "crypto";

export { CMS_COOKIE_NAME, CMS_COOKIE_VALUE, cmsCookieOptions } from "./cms-cookie";

export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Dummy compare against itself so the failure path takes comparable time.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export function credentialsOk(user: string, password: string): boolean {
  const expectedUser = process.env.CMS_USER;
  const expectedPassword = process.env.CMS_PASSWORD;
  if (!expectedUser || !expectedPassword) return false;

  const userOk = safeEqual(user, expectedUser);
  const passwordOk = safeEqual(password, expectedPassword);
  return userOk && passwordOk;
}
