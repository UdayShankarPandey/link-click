/**
 * Live SMTP delivery test — uses the configured SMTP provider (Brevo or Gmail).
 * Run: node scripts/test-smtp.js <recipient@email.com>
 */
import 'dotenv/config';
import nodemailer from 'nodemailer';

const to = process.argv[2] || process.env.FOUNDER_EMAIL;
if (!to) {
  console.error('Usage: node scripts/test-smtp.js <recipient@email.com>');
  process.exit(1);
}

const { SMTP_HOST, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;
if (!SMTP_USER || !SMTP_PASS) {
  console.error('SMTP_USER and SMTP_PASS must be set in .env');
  process.exit(1);
}

const host = SMTP_HOST || 'smtp-relay.brevo.com';
const from = EMAIL_FROM && !EMAIL_FROM.includes('@resend.dev')
  ? EMAIL_FROM
  : `Link Click <${SMTP_USER}>`;

console.log(`\nSMTP Host:   ${host}`);
console.log(`SMTP User:   ${SMTP_USER}`);
console.log(`From:        ${from}`);
console.log(`Sending to:  ${to}\n`);

const send = async (port, secure) => {
  const label = `Port ${port} ${secure ? 'SSL' : 'STARTTLS'}`;
  console.log(`Trying ${label}...`);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    tls: { rejectUnauthorized: false },
  });
  const info = await transporter.sendMail({
    from,
    to,
    subject: `Link Click — SMTP Test (${label})`,
    html: `<p>✅ SMTP is working via <strong>${label}</strong> through <strong>${host}</strong>. Verification emails will be delivered.</p>`,
  });
  console.log(`✅ ${label} — Email sent!`);
  console.log(`   MessageId: ${info.messageId}`);
  console.log(`   Response:  ${info.response}\n`);
  return true;
};

try {
  await send(587, false);
} catch (error_) {
  console.error(`❌ Port 587 failed: ${error_.message}\n`);
  try {
    await send(465, true);
  } catch (error_) {
    console.error(`❌ Port 465 failed: ${error_.message}\n`);
    console.error('Both SMTP ports failed. Check credentials and host settings.');
    process.exit(1);
  }
}
