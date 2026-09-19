"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CMS_COOKIE_NAME, CMS_COOKIE_VALUE, cmsCookieOptions, credentialsOk } from "@/lib/cms-auth";

export type LoginState = {
  ok: boolean;
  error?: string;
};

export async function login(
  _prev: LoginState | null,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!credentialsOk(username, password)) {
    return { ok: false, error: "Invalid username or password." };
  }

  const jar = await cookies();
  jar.set(CMS_COOKIE_NAME, CMS_COOKIE_VALUE, cmsCookieOptions());
  redirect("/admin/");
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  jar.delete({ name: CMS_COOKIE_NAME, path: "/" });
  redirect("/admin/login/");
}
