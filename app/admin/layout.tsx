import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { CMS_COOKIE_NAME } from "@/lib/cms-cookie";
import { logout } from "./login/actions";

export const metadata: Metadata = {
  title: "Big Dir · CMS",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jar = await cookies();
  const isLoggedIn = Boolean(jar.get(CMS_COOKIE_NAME)?.value);

  return (
    <div data-admin className="min-h-screen bg-paper text-ink">
      <header className="border-b border-rule bg-cream px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <p className="font-serif text-lg tracking-tight">Big Dir · CMS</p>
          {isLoggedIn ? (
            <nav className="flex flex-wrap items-center gap-3 text-sm">
              <Link
                href="/admin/sites"
                className="text-rust underline underline-offset-2"
              >
                Sites
              </Link>
              <span className="text-muted" aria-hidden="true">
                ·
              </span>
              <Link
                href="/admin"
                className="text-rust underline underline-offset-2"
              >
                Site CMS
              </Link>
              <span className="text-muted" aria-hidden="true">
                ·
              </span>
              <Link
                href="/admin/mailing-list"
                className="text-rust underline underline-offset-2"
              >
                Mailing list
              </Link>
            </nav>
          ) : null}
        </div>
        {isLoggedIn ? (
          <form action={logout}>
            <button
              type="submit"
              className="text-sm text-rust underline underline-offset-2"
            >
              Log out
            </button>
          </form>
        ) : null}
      </header>
      {children}
    </div>
  );
}
