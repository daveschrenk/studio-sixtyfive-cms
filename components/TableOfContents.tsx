export function TableOfContents({
  items,
}: {
  items: { id: string; label: string }[];
}) {
  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="text-xs uppercase tracking-[0.16em] text-muted mb-3">
        On this page
      </p>
      <ol className="space-y-2 border-l border-rule">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="toc-link block -ml-px border-l border-transparent pl-3 py-0.5 text-muted hover:text-ink hover:border-rust"
            >
              <span className="font-serif text-xs text-clay mr-1.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function MobileToc({
  items,
}: {
  items: { id: string; label: string }[];
}) {
  return (
    <details className="lg:hidden mb-8 border border-rule bg-cream rounded-sm">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
        Table of contents
      </summary>
      <div className="px-4 pb-4">
        <TableOfContents items={items} />
      </div>
    </details>
  );
}
