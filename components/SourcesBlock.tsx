import { SOURCES } from "@/lib/data";

export function SourcesBlock() {
  return (
    <section id="sources" className="scroll-mt-28">
      <h2 className="font-serif text-2xl">Sources</h2>
      <p className="mt-2 text-sm text-muted max-w-reading">
        Population is Census Vintage 2025 PEP (1 July 2025). Permit counts are
        Census Building Permits Survey annual 2025 (released 14 May 2026),
        one-unit units with imputation unless noted. Listing data is from the
        Big Dir DFW pack.
      </p>
      <ul className="mt-4 space-y-2 text-sm">
        {SOURCES.map((source) => (
          <li key={source.href}>
            <a
              href={source.href}
              className="text-rust hover:text-rust-dark underline underline-offset-2"
            >
              {source.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
