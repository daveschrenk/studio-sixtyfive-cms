"use client";

import { useActionState, useEffect, useState } from "react";
import { submitContact, type ContactState } from "@/app/(site)/contact/actions";

const REASONS = [
  { id: "correction", label: "Correct our listing" },
  { id: "sponsor", label: "Partnership or advertising" },
  { id: "other", label: "Something else" },
] as const;

const LISTING_COOKIE = "dfw_contact_listing";
const REASON_COOKIE = "dfw_contact_reason";

const field =
  "mt-1 w-full border border-rule bg-cream px-3 py-2 text-[15px] outline-none focus:border-rust";

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return "";
  try {
    return decodeURIComponent(match.slice(name.length + 1));
  } catch {
    return match.slice(name.length + 1);
  }
}

function clearCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
}

export function ContactForm({
  defaultListing = "",
  defaultReason = "",
}: {
  defaultListing?: string;
  defaultReason?: string;
}) {
  const [state, action, pending] = useActionState(submitContact, null as ContactState | null);
  const [listing, setListing] = useState(defaultListing);
  const [reason, setReason] = useState(
    REASONS.some((r) => r.id === defaultReason) ? defaultReason : "",
  );

  useEffect(() => {
    const cookieListing = readCookie(LISTING_COOKIE);
    const cookieReason = readCookie(REASON_COOKIE);
    if (cookieListing) {
      setListing(cookieListing);
      clearCookie(LISTING_COOKIE);
    }
    if (cookieReason && REASONS.some((r) => r.id === cookieReason)) {
      setReason(cookieReason);
      clearCookie(REASON_COOKIE);
    } else if (cookieReason) {
      clearCookie(REASON_COOKIE);
    }
  }, []);

  useEffect(() => {
    if (defaultListing) setListing(defaultListing);
  }, [defaultListing]);

  useEffect(() => {
    if (REASONS.some((r) => r.id === defaultReason)) setReason(defaultReason);
  }, [defaultReason]);

  return (
    <form action={action} className="space-y-5">
      {state?.error && (
        <p className="border border-rust/40 bg-cream px-3 py-2 text-sm text-rust">
          {state.error}
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block text-sm">
          Your name
          <input name="name" required className={field} autoComplete="name" />
        </label>
        <label className="block text-sm">
          Company
          <input name="company" required className={field} autoComplete="organization" />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block text-sm">
          Email
          <input name="email" type="email" required className={field} autoComplete="email" />
        </label>
        <label className="block text-sm">
          Phone
          <input name="phone" type="tel" className={field} autoComplete="tel" />
        </label>
      </div>

      <label className="block text-sm">
        Listing name on this site
        <input
          name="listing"
          value={listing}
          onChange={(e) => setListing(e.target.value)}
          className={field}
          placeholder="If you already appear in the directory"
        />
      </label>

      <fieldset>
        <legend className="text-sm">What do you need?</legend>
        <div className="mt-2 space-y-2">
          {REASONS.map((item) => (
            <label key={item.id} className="flex gap-2 text-sm items-start">
              <input
                type="radio"
                name="reason"
                value={item.id}
                checked={reason === item.id}
                onChange={() => setReason(item.id)}
                required
                className="mt-1"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block text-sm">
        Message
        <textarea name="message" required rows={6} className={field} />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="bg-rust text-cream px-5 py-3 text-sm font-medium hover:bg-rust-dark disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
