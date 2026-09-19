"use client";

import { useEffect, useState } from "react";

type Sub = { email: string; name: string; createdAt: string };

export default function AdminMailingListPage() {
  const [siteId, setSiteId] = useState("");
  const [subs, setSubs] = useState<Sub[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/mailing-list");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as {
          siteId: string;
          subscribers: Sub[];
        };
        if (!cancelled) {
          setSiteId(data.siteId);
          setSubs(data.subscribers || []);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto max-w-page px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl">Mailing list</h1>
          <p className="mt-1 text-sm text-muted">
            Subscribers for this site
            {siteId ? (
              <>
                {" "}
                (<span className="font-mono text-xs">{siteId}</span>)
              </>
            ) : null}
          </p>
        </div>
        <a
          href="/api/admin/mailing-list/export"
          className="rounded border border-rule bg-ink px-3 py-1.5 text-sm text-paper"
        >
          Export CSV
        </a>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-muted">Loading…</p>
      ) : error ? (
        <p className="mt-6 text-sm text-rust">{error}</p>
      ) : (
        <div className="mt-6 overflow-x-auto border border-rule bg-cream">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-rule text-left text-xs uppercase tracking-[0.1em] text-muted">
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {subs.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-6 text-center text-muted"
                  >
                    No subscribers yet.
                  </td>
                </tr>
              ) : (
                subs.map((s) => (
                  <tr key={s.email} className="border-b border-rule">
                    <td className="px-3 py-2 font-mono text-xs">{s.email}</td>
                    <td className="px-3 py-2">{s.name || "—"}</td>
                    <td className="px-3 py-2 text-muted text-xs">
                      {s.createdAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
