// Cookie constants shared by middleware (Edge runtime) and server actions.
// Kept free of Node-only APIs (like crypto) so middleware can import it
// without pulling Node built-ins into the Edge bundle.

export const CMS_COOKIE_NAME = "dfw_cms";
export const CMS_COOKIE_VALUE = "1";

export function cmsCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  };
}
