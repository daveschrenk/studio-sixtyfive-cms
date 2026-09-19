"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = { ok: false };

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center px-4">
      <div className="w-full max-w-sm border border-rule bg-cream p-6">
        <p className="font-serif text-lg tracking-tight">
          DFW Garage Door Installers · CMS
        </p>
        <p className="mt-1 text-sm text-muted">Sign in to manage listings.</p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="username" className="text-xs uppercase tracking-[0.14em] text-muted">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="mt-1 w-full border border-rule bg-paper px-3 py-2 text-sm focus:border-rust focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-xs uppercase tracking-[0.14em] text-muted">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 w-full border border-rule bg-paper px-3 py-2 text-sm focus:border-rust focus:outline-none"
            />
          </div>

          {state.error ? (
            <p className="text-sm text-rust-dark">{state.error}</p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full border border-rule px-3 py-2 text-sm hover:border-rust disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
