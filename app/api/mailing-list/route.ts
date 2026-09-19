import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { addSubscriber } from "@/lib/mailing-list/store";
import { getTenantByHost } from "@/lib/tenants";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const h = await headers();
  const siteIdHeader = h.get("x-site-id");
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const siteId = siteIdHeader || getTenantByHost(host).siteId;

  let email = "";
  let name = "";
  try {
    const body = (await request.json()) as { email?: string; name?: string };
    email = String(body.email ?? "").trim();
    name = String(body.name ?? "").trim();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const result = await addSubscriber(siteId, email, name);
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    if (result.created) {
      // Best-effort notify inbox (same stack as contact form)
      try {
        const apiKey = process.env.RESEND_API_KEY;
        const inbox = process.env.CONTACT_INBOX ?? "megapokeballs@gmail.com";
        if (apiKey) {
          const from =
            process.env.CONTACT_FROM?.includes("@")
              ? process.env.CONTACT_FROM
              : "DFW Garage Door Installers <onboarding@resend.dev>";
          const resend = new Resend(apiKey);
          await resend.emails.send({
            from: from!,
            to: [inbox],
            subject: `[mailing-list] ${siteId}: ${email}`,
            text: [
              `Site: ${siteId}`,
              `Email: ${email}`,
              `Name: ${name || "(none)"}`,
              `Created: ${new Date().toISOString()}`,
            ].join("\n"),
          });
        }
      } catch (err) {
        console.error("[mailing-list] notify failed", err);
      }
    }

    return NextResponse.json({
      ok: true,
      created: result.created,
      message: result.created
        ? "You're on the list."
        : "You're already subscribed.",
    });
  } catch (err) {
    console.error("[mailing-list] store failed", err);
    return NextResponse.json(
      { ok: false, error: "Could not save signup. Try again." },
      { status: 500 },
    );
  }
}
