/**
 * Live SMTP delivery test — tries port 587 (STARTTLS) then port 465 (SSL).
 * Run: node scripts/test-smtp.js <recipient@email.com>
 */
import 'dotenv/config';
import nodemailer from 'nodemailer';

const to = process.argv[2] || process.env.FOUNDER_EMAIL;
if (!to) {
  console.error('Usage: node scripts/test-smtp.js <recipient@email.com>');
  process.exit(1);
}

const { SMTP_USER, SMTP_PASS } = process.env;
if (!SMTP_USER || !SMTP_PASS) {
  console.error('SMTP_USER and SMTP_PASS must be set in .env');
  process.exit(1);
}

console.log(`\nSending test email to: ${to}`);
console.log(`Using Gmail account:   ${SMTP_USER}\n`);

const send = async (port, secure) => {
  const label = `Port ${port} ${secure ? 'SSL' : 'STARTTLS'}`;
  console.log(`Trying ${label}...`);
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port,
    secure,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    tls: { rejectUnauthorized: false },
  });
  const info = await transporter.sendMail({
    from: `Link Click <${SMTP_USER}>`,
    to,
    subject: `Link Click — SMTP Test (${label})`,
    html: `<p>✅ Gmail SMTP is working via <strong>${label}</strong>! Verification emails will be delivered.</p>`,
  });
  console.log(`✅ ${label} — Email sent!`);
  console.log(`   MessageId: ${info.messageId}`);
  console.log(`   Response:  ${info.response}\n`);
  return true;
};

// Try 587 first, then 465
try {
  await send(587, false);
} catch (err587) {
  console.error(`❌ Port 587 failed: ${err587.message}\n`);
  try {
    await send(465, true);
  } catch (err465) {
    console.error(`❌ Port 465 failed: ${err465.message}\n`);
    console.error('Both SMTP ports failed. Check App Password and Gmail settings.');
    process.exit(1);
  }
}
