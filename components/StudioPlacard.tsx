import Link from "next/link";

/** Public front-of-house for studiosixtyfive.com when CMS cookie is absent. */
export function StudioPlacard() {
  return (
    <div className="mx-auto max-w-page px-4 sm:px-6 py-16 pb-20">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">
        Big Dir / Studio Sixtyfive
      </p>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl text-ink tracking-tight">
        Studio Sixtyfive
      </h1>
      <p className="mt-4 max-w-xl text-base text-muted leading-relaxed">
        Directory factory workspace. Public site is a placeholder placard —
        sign in to the CMS for sites, factory tools, and previews.
      </p>
      <p className="mt-8">
        <Link
          href="/admin/login/"
          className="inline-flex items-center rounded border border-rule bg-ink px-4 py-2 text-sm text-paper hover:border-rust"
        >
          CMS login
        </Link>
      </p>
    </div>
  );
}
