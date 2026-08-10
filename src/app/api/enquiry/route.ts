import { NextResponse } from "next/server";

import { site } from "@/lib/site";

/**
 * Enquiry handler.
 *
 * Delivery is pluggable and configured entirely by environment variable — see
 * `.env.example`. Nothing is hardcoded, and no credential is ever exposed to
 * the browser: the Resend key is read here, on the server, only.
 *
 * The important property is that this never fails silently. If no provider is
 * configured in production it returns 503 with a message telling the visitor
 * to phone instead, rather than showing a success state for an enquiry that
 * went nowhere.
 */

export const runtime = "nodejs";

type Payload = {
  name?: string;
  phone?: string;
  email?: string;
  course?: string;
  mode?: string;
  company?: string;
  teamSize?: string;
  message?: string;
  /** Honeypot. Must be empty. */
  website?: string;
  formType?: string;
};

const MAX = {
  name: 120,
  phone: 30,
  email: 160,
  course: 120,
  mode: 40,
  company: 160,
  teamSize: 40,
  message: 4000,
};

function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

/** Indian mobile numbers, allowing spaces, dashes and an optional +91. */
function validPhone(phone: string): boolean {
  const digits = phone.replace(/[^\d]/g, "");
  return digits.length >= 10 && digits.length <= 13;
}

function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "That request could not be read. Please try again." },
      { status: 400 },
    );
  }

  // Honeypot: a real person never fills a field they cannot see. Respond with
  // a normal success so a bot learns nothing from the difference.
  if (clean(body.website, 200) !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = clean(body.name, MAX.name);
  const phone = clean(body.phone, MAX.phone);
  const email = clean(body.email, MAX.email);
  const course = clean(body.course, MAX.course);
  const mode = clean(body.mode, MAX.mode);
  const company = clean(body.company, MAX.company);
  const teamSize = clean(body.teamSize, MAX.teamSize);
  const message = clean(body.message, MAX.message);
  const formType = clean(body.formType, 40) || "general";

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Please enter your name.";
  if (!validPhone(phone)) errors.phone = "Please enter a phone number we can reach you on.";
  if (email && !validEmail(email)) errors.email = "That email address does not look right.";
  if (formType === "corporate" && company.length < 2) {
    errors.company = "Please enter your company name.";
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const lines = [
    `Form: ${formType}`,
    `Name: ${name}`,
    `Phone: ${phone}`,
    email && `Email: ${email}`,
    company && `Company: ${company}`,
    teamSize && `Team size: ${teamSize}`,
    course && `Course of interest: ${course}`,
    mode && `Preferred mode: ${mode}`,
    message && `\nMessage:\n${message}`,
  ]
    .filter(Boolean)
    .join("\n");

  const subject = `Website enquiry — ${course || (formType === "corporate" ? "Corporate training" : "General")}`;

  // --- Option A: Formspree ------------------------------------------------
  const formspreeId = process.env.NEXT_PUBLIC_FORMSPREE_ID;
  if (formspreeId) {
    try {
      const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          company,
          teamSize,
          course,
          mode,
          message,
          _subject: subject,
        }),
      });
      if (!response.ok) throw new Error(`Formspree responded ${response.status}`);
      return NextResponse.json({ ok: true });
    } catch (error) {
      console.error("Enquiry delivery failed (Formspree):", error);
      return deliveryFailed();
    }
  }

  // --- Option B: Resend ---------------------------------------------------
  const resendKey = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_TO_EMAIL ?? site.email;
  const from = process.env.ENQUIRY_FROM_EMAIL;
  if (resendKey && from) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: email || undefined,
          subject,
          text: lines,
        }),
      });
      if (!response.ok) throw new Error(`Resend responded ${response.status}`);
      return NextResponse.json({ ok: true });
    } catch (error) {
      console.error("Enquiry delivery failed (Resend):", error);
      return deliveryFailed();
    }
  }

  // --- No provider configured --------------------------------------------
  if (process.env.NODE_ENV !== "production") {
    console.info("[enquiry] No provider configured. Payload:\n" + lines);
    return NextResponse.json({ ok: true, note: "development" });
  }

  console.error(
    "Enquiry received but no delivery provider is configured. Set NEXT_PUBLIC_FORMSPREE_ID or RESEND_API_KEY.",
  );
  return deliveryFailed();
}

function deliveryFailed() {
  return NextResponse.json(
    {
      ok: false,
      error:
        "We could not send that just now. Please call us instead — the numbers are at the bottom of the page.",
    },
    { status: 503 },
  );
}
