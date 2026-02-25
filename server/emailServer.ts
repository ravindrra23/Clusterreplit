import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(cors({ origin: true }));

app.post('/api/send-recovery-email', async (req, res) => {
  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ success: false, error: 'Missing required fields: to, subject, html' });
  }

  const smtpEmail = process.env.SMTP_EMAIL?.trim();
  const smtpPassword = process.env.SMTP_APP_PASSWORD?.replace(/\s/g, '').trim();

  if (!smtpEmail || !smtpPassword) {
    return res.status(503).json({
      success: false,
      error: 'Email service not configured. Set SMTP_EMAIL and SMTP_APP_PASSWORD in environment secrets.'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
    });

    await transporter.sendMail({
      from: `"ClusterGrowth" <${smtpEmail}>`,
      to,
      subject,
      html,
    });

    return res.json({ success: true, message: `Recovery email sent to ${to}` });
  } catch (err: any) {
    console.error('[EmailServer] Failed to send email:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/email-status', (_req, res) => {
  const configured = !!(process.env.SMTP_EMAIL && process.env.SMTP_APP_PASSWORD);
  res.json({ configured, email: process.env.SMTP_EMAIL || null });
});

const isProduction = process.env.NODE_ENV === 'production';
const PORT = isProduction
  ? parseInt(process.env.PORT || '5000', 10)
  : parseInt(process.env.EMAIL_SERVER_PORT || '3001', 10);

if (isProduction) {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('/{*path}', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[EmailServer] Running on port ${PORT} (${isProduction ? 'production' : 'development'})`);
});
