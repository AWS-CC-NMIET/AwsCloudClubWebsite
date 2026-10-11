// lib/ses.ts
// Amazon SES: contact-form notification email to the club inbox.

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import { AWS_REGION, awsClientConfig } from "@/lib/aws-clients"
import { CLUB } from "@/lib/club-content"

const sesClient = new SESClient(awsClientConfig(process.env.SES_REGION || AWS_REGION))

// FROM must be an SES-verified identity — configure it with SES_FROM_EMAIL.
const FROM_EMAIL = process.env.SES_FROM_EMAIL || "awscloudclub.nmiet@gmail.com"
const TO_EMAIL = process.env.SES_TO_EMAIL || CLUB.email

/** Visitors control these values — escape them before putting them in HTML. */
function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
}

export async function sendContactEmail(params: { name: string; email: string; subject: string; message: string }) {
  const name = escapeHtml(params.name)
  const email = escapeHtml(params.email)
  const subject = escapeHtml(params.subject)
  const message = escapeHtml(params.message)

  await sesClient.send(
    new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: { ToAddresses: [TO_EMAIL] },
      ReplyToAddresses: [params.email],
      Message: {
        Subject: { Data: `[${CLUB.shortName} Website] ${params.subject.replace(/[\r\n]+/g, " ")}`, Charset: "UTF-8" },
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f7;border-radius:14px;overflow:hidden;border:1px solid #e5e5ea">
  <div style="background:#1d1d1f;padding:22px 24px">
    <p style="color:#FF9900;margin:0;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">New contact message</p>
    <h2 style="color:#fff;margin:6px 0 0;font-size:19px">${CLUB.name} · ${CLUB.collegeShort}</h2>
  </div>
  <div style="padding:22px 24px;background:#fff">
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:6px 0;color:#86868b;width:80px">Name</td><td style="padding:6px 0;color:#1d1d1f;font-weight:600">${name}</td></tr>
      <tr><td style="padding:6px 0;color:#86868b">Email</td><td style="padding:6px 0"><a href="mailto:${email}" style="color:#7940ea">${email}</a></td></tr>
      <tr><td style="padding:6px 0;color:#86868b">Subject</td><td style="padding:6px 0;color:#1d1d1f;font-weight:600">${subject}</td></tr>
    </table>
    <div style="margin-top:16px;padding:16px;border-radius:10px;background:#f5f5f7;color:#1d1d1f;line-height:1.6;white-space:pre-wrap;font-size:14px">${message}</div>
    <p style="margin:16px 0 0;font-size:12px;color:#86868b">Reply to this email to answer ${name} directly.</p>
  </div>
  <div style="padding:14px 24px;text-align:center;font-size:12px;color:#86868b">${CLUB.name} · ${CLUB.collegeShort} · ${CLUB.email}</div>
</div>`,
          },
          Text: {
            Charset: "UTF-8",
            Data: `New message from ${params.name} (${params.email})\n\nSubject: ${params.subject}\n\n${params.message}`,
          },
        },
      },
    })
  )
}
