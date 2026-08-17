import asyncHandler from '../utils/asyncHandler.js';
import apiResponse from '../utils/apiResponse.js';
import { healthService } from '../services/health.service.js';
import nodemailer from 'nodemailer';
import env from '../config/env.js';

export const getHealth = asyncHandler(async (req, res) => {
  const data = healthService.checkHealth();
  return apiResponse(res, 200, 'Server is healthy.', data);
});

export const getReadiness = asyncHandler(async (req, res) => {
  const data = healthService.checkReadiness();
  const statusCode = data.status === 'READY' ? 200 : 503;
  return apiResponse(res, statusCode, 'Readiness status retrieved.', data);
});

// TEMPORARY: SMTP diagnostic endpoint — remove after email delivery is confirmed
export const smtpTest = asyncHandler(async (req, res) => {
  const { secret, to = env.FOUNDER_EMAIL } = req.query;
  if (secret !== env.JWT_SECRET) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  // Get this server's outbound public IP so we can authorize it in Brevo
  let serverIp = 'unknown';
  try {
    const ipRes = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipRes.json();
    serverIp = ipData.ip;
  } catch (_) { /* ignore */ }

  const host = env.SMTP_HOST || 'smtp-relay.brevo.com';
  const results = [];

  for (const [port, secure] of [[587, false], [465, true]]) {
    try {
      const transporter = nodemailer.createTransport({
        host, port, secure,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
        connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 12000,
        tls: { rejectUnauthorized: false },
      });
      const info = await transporter.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject: `[Render SMTP Test] Port ${port}`,
        text: `SMTP working via port ${port} from Render server.`,
      });
      results.push({ port, success: true, messageId: info.messageId, response: info.response });
      break;
    } catch (err) {
      results.push({ port, success: false, error: err.message, code: err.code });
    }
  }

  return res.json({
    serverIp,
    host, user: env.SMTP_USER,
    passSet: !!env.SMTP_PASS, from: env.EMAIL_FROM,
    to, results,
  });
});
