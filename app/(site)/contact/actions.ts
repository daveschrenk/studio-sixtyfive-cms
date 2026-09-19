"use server";

import { redirect } from "next/navigation";
import { Resend } from "resend";

export type ContactState = {
  ok: boolean;
  error?: string;
};

const REASONS = new Set([
  "correction",
  "sponsor",
  "other",
]);

export async function submitContact(
  _prev: ContactState | null,
  formData: FormData,
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const listing = String(formData.get("listing") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !company || !email || !reason || !message) {
    return { ok: false, error: "Name, company, email, reason, and message are required." };
  }
  if (!email.includes("@") || !email.includes(".")) {
    return { ok: false, error: "Enter a valid email." };
  }
  if (!REASONS.has(reason)) {
    return { ok: false, error: "Pick a reason." };
  }

  console.log("[contact]", { name, company, email, phone, listing, reason, message: message.slice(0, 500) });

  // TODO: switch CONTACT_INBOX to Proton when that mailbox exists.
  const inbox = process.env.CONTACT_INBOX ?? "megapokeballs@gmail.com";
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY missing");
    return { ok: false, error: "Could not send your message. Try again, or email us directly." };
  }

  const DEFAULT_FROM =
    "DFW Garage Door Installers <onboarding@resend.dev>";
  const rawFrom = (process.env.CONTACT_FROM ?? "").trim();
  // Resend requires `email@x` or `Name <email@x>`; reject mangled env (e.g. brackets stripped).
  const from =
    rawFrom.includes("@") && (rawFrom.includes("<") ? rawFrom.includes(">") : true)
      ? rawFrom
      : DEFAULT_FROM;

  const resend = new Resend(apiKey);
  const text = [
    `Name: ${name}`,
    `Company: ${company}`,
    `Email: ${email}`,
    `Phone: ${phone || "(none)"}`,
    `Listing: ${listing || "(none)"}`,
    `Reason: ${reason}`,
    "",
    message,
  ].join("\n");

  try {
    const result = await resend.emails.send({
      from,
      to: [inbox],
      replyTo: email,
      subject: `New contact form submission from ${name}`,
      text,
    });

    console.log("[contact] resend", JSON.stringify(result).slice(0, 500));

    if (result.error) {
      console.error("[contact] resend error", result.error);
      return { ok: false, error: "Could not send your message. Try again, or email us directly." };
    }
  } catch (err) {
    console.error("[contact] resend exception", err);
    return { ok: false, error: "Could not send your message. Try again, or email us directly." };
  }

  redirect("/contact/thanks/");
}
