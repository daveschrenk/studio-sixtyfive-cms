"use client";

import { useState } from "react";

type Variant = "full" | "header";

export function MailingListHeaderSignup() {
  return <MailingListForm variant="header" />;
}

export function MailingListForm({
  variant = "full",
}: {
  variant?: Variant;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/mailing-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Signup failed");
      }
      setStatus("ok");
      setMessage(data.message || "You're on the list.");
      setEmail("");
      setName("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Signup failed");
    }
  }

  if (variant === "header") {
    return (
      <div className="min-w-0">
        {status === "ok" ? (
          <p className="text-xs text-muted whitespace-nowrap" role="status">
            {message || "You're on the list."}
          </p>
        ) : (
          <form
            onSubmit={onSubmit}
            aria-label="Mailing list signup"
            className="flex items-center gap-1.5"
          >
            <label className="sr-only" htmlFor="header-mailing-email">
              Email
            </label>
            <input
              id="header-mailing-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-[8.5rem] sm:w-[11rem] border border-rule bg-paper px-2 py-1 text-xs sm:text-sm"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="shrink-0 border border-rule bg-ink px-2 py-1 text-xs sm:text-sm text-paper disabled:opacity-60"
            >
              {status === "loading" ? "Saving…" : "Subscribe"}
            </button>
          </form>
        )}
        {status === "error" && message ? (
          <p className="mt-1 text-[11px] text-rust" role="alert">
            {message}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.14em] text-muted">
        Mailing list
      </p>
      <p className="mt-2 text-sm text-muted leading-relaxed">
        Get listing updates for this directory. Unsubscribe anytime.
      </p>
      <form onSubmit={onSubmit} className="mt-3 space-y-2">
        <input
          type="text"
          name="name"
          autoComplete="name"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-rule bg-paper px-2 py-1.5 text-sm"
        />
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-rule bg-paper px-2 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full border border-rule bg-ink px-2 py-1.5 text-sm text-paper disabled:opacity-60"
        >
          {status === "loading" ? "Saving…" : "Subscribe"}
        </button>
      </form>
      {message ? (
        <p
          className={`mt-2 text-xs ${
            status === "error" ? "text-rust" : "text-muted"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
