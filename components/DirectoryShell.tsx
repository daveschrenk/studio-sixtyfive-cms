export function DirectoryShell({
  toc,
  children,
}: {
  toc: { id: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-reading-page px-4 sm:px-6 py-10 sm:py-14">
      <nav aria-label="On this page" className="mb-10 border-b border-rule pb-6">
        <p className="text-xs uppercase tracking-[0.16em] text-muted mb-3">
          On this page
        </p>
        <ol className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {toc.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="text-muted hover:text-rust">
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
