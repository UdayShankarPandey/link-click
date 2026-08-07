/**
 * Quick smoke test: sends a real verification email via Gmail SMTP.
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

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
});

try {
  const info = await transporter.sendMail({
    from: `Link Click <${SMTP_USER}>`,
    to,
    subject: 'Link Click — SMTP Test',
    html: '<p>✅ Gmail SMTP is working! Verification emails will now be delivered to all users.</p>',
  });
  console.log('✅ Email sent successfully!');
  console.log('   MessageId:', info.messageId);
  console.log('   Response: ', info.response);
} catch (err) {
  console.error('❌ SMTP Error:', err.message);
  process.exit(1);
}
