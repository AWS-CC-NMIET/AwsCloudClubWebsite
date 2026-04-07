// lib/ses.ts
// Amazon SES helper for sending emails

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"

const sesClient = new SESClient({
  region: process.env.SES_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const FROM_EMAIL = process.env.SES_FROM_EMAIL || "awscloudclub.nmiet@gmail.com"
const TO_EMAIL   = process.env.SES_TO_EMAIL   || "awscloudclub.nmiet@gmail.com"

export async function sendContactEmail(params: {
  name: string
  email: string
  subject: string
  message: string
}) {
  const command = new SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: { ToAddresses: [TO_EMAIL] },
    ReplyToAddresses: [params.email],
    Message: {
      Subject: {
        Data: `[AWS Cloud Club Website] ${params.subject}`,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f7ff; border-radius: 12px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #6B4FE8, #8B6FFF); padding: 24px; text-align: center;">
                <h2 style="color: white; margin: 0; font-size: 20px;">AWS Cloud Club NMIET</h2>
                <p style="color: rgba(255,255,255,0.75); margin: 4px 0 0; font-size: 13px;">New Contact Form Submission</p>
              </div>
              <div style="padding: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; color: #7B6FC0; font-size: 13px; width: 90px;">Name</td><td style="padding: 8px 0; color: #1E1060; font-weight: 600;">${params.name}</td></tr>
                  <tr><td style="padding: 8px 0; color: #7B6FC0; font-size: 13px;">Email</td><td style="padding: 8px 0; color: #1E1060;"><a href="mailto:${params.email}" style="color: #6B4FE8;">${params.email}</a></td></tr>
                  <tr><td style="padding: 8px 0; color: #7B6FC0; font-size: 13px;">Subject</td><td style="padding: 8px 0; color: #1E1060; font-weight: 600;">${params.subject}</td></tr>
                </table>
                <div style="background: white; border-radius: 8px; padding: 16px; margin-top: 16px; border: 1px solid #E8E4FF;">
                  <p style="color: #7B6FC0; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">Message</p>
                  <p style="color: #1E1060; margin: 0; line-height: 1.6; white-space: pre-wrap;">${params.message}</p>
                </div>
              </div>
              <div style="background: #EAE6FF; padding: 16px; text-align: center;">
                <p style="color: #9B8FC8; font-size: 12px; margin: 0;">AWS Cloud Club NMIET · awscloudclub.nmiet@gmail.com</p>
              </div>
            </div>
          `,
        },
        Text: {
          Charset: "UTF-8",
          Data: `New message from ${params.name} (${params.email})\n\nSubject: ${params.subject}\n\nMessage:\n${params.message}`,
        },
      },
    },
  })

  await sesClient.send(command)
}

// ── Send welcome email to new members ────────────────────────
export async function sendWelcomeEmail(toEmail: string, name: string) {
  const command = new SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: { ToAddresses: [toEmail] },
    Message: {
      Subject: {
        Data: "Welcome to AWS Cloud Club NMIET! ☁️",
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #6B4FE8, #8B6FFF); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to AWS Cloud Club!</h1>
                <p style="color: rgba(255,255,255,0.80); margin: 8px 0 0;">NMIET Chapter</p>
              </div>
              <div style="background: #EAE6FF; padding: 32px; border-radius: 0 0 12px 12px;">
                <p style="color: #1E1060; font-size: 16px;">Hi ${name},</p>
                <p style="color: #7B6FC0; line-height: 1.6;">You've successfully joined the AWS Cloud Club NMIET community. Explore our cloud-powered OS, check out upcoming events, and connect with fellow cloud enthusiasts!</p>
                <div style="text-align: center; margin: 24px 0;">
                  <p style="color: #9B8FC8; font-size: 13px;">— AWS Cloud Club NMIET Team ☁️</p>
                </div>
              </div>
            </div>
          `,
        },
        Text: {
          Charset: "UTF-8",
          Data: `Welcome to AWS Cloud Club NMIET, ${name}! You're now part of our community.`,
        },
      },
    },
  })

  try { await sesClient.send(command) } catch { /* non-critical, don't fail signup */ }
}
