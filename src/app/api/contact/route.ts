import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const SUBJECT_CATEGORY_LABELS: Record<string, string> = {
  "general-question": "General question",
  "feature-suggestion": "Feature suggestion",
  "issue-error": "Issue / error",
  "business-inquiry": "Business inquiry",
  other: "Other",
};
const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
]);

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(req: Request) {
  const formData = await req.formData();

  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const subjectCategoryRaw = String(formData.get("subjectCategory") ?? "").trim();
  const subjectTitle = String(formData.get("subjectTitle") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const maybeAttachment = formData.get("attachment");
  const subjectCategory = SUBJECT_CATEGORY_LABELS[subjectCategoryRaw] ? subjectCategoryRaw : "";

  if (!name || !email || !subjectCategory || !message) {
    return NextResponse.json({ ok: false, error: "Please complete all required fields." }, { status: 400 });
  }
  if (name.length > 120 || email.length > 200 || subjectTitle.length > 200 || message.length > 5000) {
    return NextResponse.json({ ok: false, error: "One or more fields are too long." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;

  if (!resendApiKey || !toEmail || !fromEmail) {
    return NextResponse.json(
      { ok: false, error: "Contact form is not configured yet." },
      { status: 500 },
    );
  }

  let attachment:
    | {
        filename: string;
        content: string;
      }[]
    | undefined;

  if (maybeAttachment instanceof File && maybeAttachment.size > 0) {
    if (maybeAttachment.size > MAX_ATTACHMENT_BYTES) {
      return NextResponse.json({ ok: false, error: "Attachment must be 5MB or smaller." }, { status: 400 });
    }
    if (!ALLOWED_IMAGE_TYPES.has(maybeAttachment.type)) {
      return NextResponse.json({ ok: false, error: "Only image attachments are allowed." }, { status: 400 });
    }

    const base64Content = Buffer.from(await maybeAttachment.arrayBuffer()).toString("base64");
    attachment = [
      {
        filename: maybeAttachment.name || "screenshot.png",
        content: base64Content,
      },
    ];
  }

  const { userId } = await auth();
  const clerkUser = userId ? await currentUser() : null;
  const reporterName = clerkUser
    ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || "Signed-in user"
    : "Visitor";

  const subjectLine = subjectTitle
    ? `[MyPilotPage Contact] ${SUBJECT_CATEGORY_LABELS[subjectCategory]} - ${subjectTitle}`
    : `[MyPilotPage Contact] ${SUBJECT_CATEGORY_LABELS[subjectCategory]}`;

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: email,
      subject: subjectLine,
      html: `
        <h2>New contact message</h2>
        <p><strong>Category:</strong> ${escapeHtml(SUBJECT_CATEGORY_LABELS[subjectCategory])}</p>
        ${subjectTitle ? `<p><strong>Subject:</strong> ${escapeHtml(subjectTitle)}</p>` : ""}
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Session:</strong> ${escapeHtml(reporterName)}${userId ? ` (${escapeHtml(userId)})` : ""}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replaceAll("\n", "<br/>")}</p>
      `,
      attachments: attachment,
    }),
  });

  if (!emailResponse.ok) {
    const failText = await emailResponse.text().catch(() => "");
    console.error("Contact send failed", failText);
    return NextResponse.json(
      { ok: false, error: "Unable to send message right now. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
