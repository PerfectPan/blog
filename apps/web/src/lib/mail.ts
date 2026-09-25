import { getWebEnv } from './env.js';

const env = getWebEnv();

/** Whether outgoing mail is configured (RESEND_API_KEY and MAIL_FROM set). */
export const mailEnabled = Boolean(env.resendApiKey && env.mailFrom);

type Mail = { to: string; subject: string; text: string; html: string };

/** Send one transactional mail through Resend's HTTP API. */
export async function sendMail(mail: Mail): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.resendApiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ from: env.mailFrom, ...mail }),
  });
  if (!response.ok) {
    throw new Error(
      `[web] Resend rejected the mail: ${response.status} ${await response.text()}`,
    );
  }
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

/** How long a verification link stays valid; the mail text states it. */
export const VERIFY_LINK_TTL_S = 60 * 60;

export function verificationMail(name: string, url: string) {
  return {
    subject: "Verify your email for PerfectPan's Blog",
    text: `Hi ${name},\n\nOpen this link to verify your email:\n${url}\n\nThe link expires in 1 hour. If you didn't sign up, ignore this mail.`,
    html: `<p>Hi ${escapeHtml(name)},</p><p><a href="${escapeHtml(url)}">Verify your email</a> for PerfectPan's Blog.</p><p>The link expires in 1 hour. If you didn't sign up, ignore this mail.</p>`,
  };
}
