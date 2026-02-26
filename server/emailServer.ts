import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors({ origin: true }));

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function initAuthTables() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS auth_businesses (
        id TEXT PRIMARY KEY,
        login_id TEXT,
        owner_password TEXT DEFAULT '1234',
        name TEXT NOT NULL,
        data JSONB NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_businesses_login_id ON auth_businesses(login_id) WHERE login_id IS NOT NULL;

      CREATE TABLE IF NOT EXISTS auth_super_admin (
        id TEXT PRIMARY KEY DEFAULT 'default',
        email TEXT NOT NULL,
        password TEXT NOT NULL
      );
      INSERT INTO auth_super_admin (id, email, password)
        VALUES ('default', 'admin@clustergrowth.com', 'admin@123')
        ON CONFLICT (id) DO NOTHING;

      CREATE TABLE IF NOT EXISTS auth_sub_admins (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        data JSONB NOT NULL
      );

      CREATE TABLE IF NOT EXISTS auth_clusters (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL
      );
    `);
    console.log('[AuthDB] Tables initialized');
  } catch (err: any) {
    console.error('[AuthDB] Init error:', err.message);
  } finally {
    client.release();
  }
}

app.post('/api/auth/sync-business', async (req, res) => {
  try {
    const { id, loginId, ownerPassword, name, data } = req.body;
    if (!id || !name) return res.status(400).json({ success: false, error: 'Missing id or name' });
    await pool.query(
      `INSERT INTO auth_businesses (id, login_id, owner_password, name, data)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET login_id = $2, owner_password = $3, name = $4, data = $5`,
      [id, loginId || null, ownerPassword || '1234', name, JSON.stringify(data)]
    );
    res.json({ success: true });
  } catch (err: any) {
    console.error('[AuthDB] sync-business error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/sync-all-businesses', async (req, res) => {
  try {
    const { businesses } = req.body;
    if (!Array.isArray(businesses)) return res.status(400).json({ success: false, error: 'businesses must be array' });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const biz of businesses) {
        await client.query(
          `INSERT INTO auth_businesses (id, login_id, owner_password, name, data)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO UPDATE SET login_id = $2, owner_password = $3, name = $4, data = $5`,
          [biz.id, biz.loginId || null, biz.ownerPassword || '1234', biz.name, JSON.stringify(biz)]
        );
      }
      await client.query('COMMIT');
      res.json({ success: true, count: businesses.length });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('[AuthDB] sync-all-businesses error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/delete-business', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, error: 'Missing id' });
    await pool.query('DELETE FROM auth_businesses WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/verify-merchant', async (req, res) => {
  try {
    const { loginId, password } = req.body;
    if (!loginId || !password) return res.json({ success: false, business: null });
    const result = await pool.query(
      'SELECT data FROM auth_businesses WHERE login_id = $1 AND owner_password = $2',
      [loginId, password]
    );
    if (result.rows.length > 0) {
      res.json({ success: true, business: result.rows[0].data });
    } else {
      res.json({ success: false, business: null });
    }
  } catch (err: any) {
    console.error('[AuthDB] verify-merchant error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/get-business-by-login-id', async (req, res) => {
  try {
    const { loginId } = req.body;
    if (!loginId) return res.json({ success: false, business: null });
    const result = await pool.query(
      'SELECT data FROM auth_businesses WHERE login_id = $1',
      [loginId]
    );
    if (result.rows.length > 0) {
      res.json({ success: true, business: result.rows[0].data });
    } else {
      res.json({ success: false, business: null });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/auth/get-all-businesses', async (_req, res) => {
  try {
    const result = await pool.query('SELECT data FROM auth_businesses ORDER BY name');
    const businesses = result.rows.map(r => r.data);
    res.json({ success: true, businesses });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/sync-admin-config', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Missing email or password' });
    await pool.query(
      `INSERT INTO auth_super_admin (id, email, password) VALUES ('default', $1, $2)
       ON CONFLICT (id) DO UPDATE SET email = $1, password = $2`,
      [email, password]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/verify-admin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.json({ success: false });
    const result = await pool.query(
      "SELECT * FROM auth_super_admin WHERE id = 'default' AND email = $1 AND password = $2",
      [email, password]
    );
    res.json({ success: result.rows.length > 0 });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/auth/get-admin-config', async (_req, res) => {
  try {
    const result = await pool.query("SELECT email, password FROM auth_super_admin WHERE id = 'default'");
    if (result.rows.length > 0) {
      res.json({ success: true, config: result.rows[0] });
    } else {
      res.json({ success: true, config: { email: 'admin@clustergrowth.com', password: 'admin@123' } });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/sync-sub-admins', async (req, res) => {
  try {
    const { subAdmins } = req.body;
    if (!Array.isArray(subAdmins)) return res.status(400).json({ success: false });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM auth_sub_admins');
      for (const sa of subAdmins) {
        await client.query(
          'INSERT INTO auth_sub_admins (id, email, password, data) VALUES ($1, $2, $3, $4)',
          [sa.id, sa.email, sa.password, JSON.stringify(sa)]
        );
      }
      await client.query('COMMIT');
      res.json({ success: true });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/verify-sub-admin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.json({ success: false, staff: null });
    const result = await pool.query(
      'SELECT data FROM auth_sub_admins WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length > 0) {
      res.json({ success: true, staff: result.rows[0].data });
    } else {
      res.json({ success: false, staff: null });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/verify-sub-merchant', async (req, res) => {
  try {
    const { email, password, merchantName } = req.body;
    if (!email || !password || !merchantName) return res.json({ success: false, business: null });
    const result = await pool.query('SELECT data FROM auth_businesses');
    const businesses = result.rows.map(r => r.data);
    const biz = businesses.find((b: any) =>
      b.subMerchantEmail === email &&
      b.subMerchantPassword === password &&
      b.name.toLowerCase() === merchantName.toLowerCase().trim()
    );
    if (biz) {
      res.json({ success: true, business: biz });
    } else {
      res.json({ success: false, business: null });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/sync-clusters', async (req, res) => {
  try {
    const { clusters } = req.body;
    if (!Array.isArray(clusters)) return res.status(400).json({ success: false });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM auth_clusters');
      for (const c of clusters) {
        await client.query(
          'INSERT INTO auth_clusters (id, data) VALUES ($1, $2)',
          [c.id, JSON.stringify(c)]
        );
      }
      await client.query('COMMIT');
      res.json({ success: true });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/auth/get-all-clusters', async (_req, res) => {
  try {
    const result = await pool.query('SELECT data FROM auth_clusters ORDER BY id');
    const clusters = result.rows.map(r => r.data);
    res.json({ success: true, clusters });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/get-recovery-email', async (req, res) => {
  try {
    const { role, identifier, merchantName } = req.body;
    if (role === 'SUPER_ADMIN') {
      const result = await pool.query("SELECT email FROM auth_super_admin WHERE id = 'default'");
      return res.json({ success: true, email: result.rows[0]?.email || null });
    }
    if (role === 'BUSINESS_OWNER') {
      const result = await pool.query('SELECT data FROM auth_businesses WHERE login_id = $1', [identifier]);
      const biz = result.rows[0]?.data;
      return res.json({ success: true, email: biz?.email || null });
    }
    if (role === 'SUB_ADMIN') {
      const result = await pool.query('SELECT email FROM auth_sub_admins WHERE email = $1', [identifier]);
      return res.json({ success: true, email: result.rows[0]?.email || null });
    }
    if (role === 'SUB_MERCHANT') {
      const result = await pool.query('SELECT data FROM auth_businesses');
      const businesses = result.rows.map(r => r.data);
      const biz = businesses.find((b: any) =>
        b.name.toLowerCase() === (merchantName || '').toLowerCase().trim() &&
        b.subMerchantEmail === identifier
      );
      return res.json({ success: true, email: biz?.subMerchantEmail || null });
    }
    res.json({ success: false, email: null });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { role, email, newPassword, businessLoginId, merchantName } = req.body;
    if (role === 'SUPER_ADMIN') {
      await pool.query("UPDATE auth_super_admin SET password = $1 WHERE id = 'default'", [newPassword]);
      return res.json({ success: true });
    }
    if (role === 'BUSINESS_OWNER' && businessLoginId) {
      const result = await pool.query('SELECT data FROM auth_businesses WHERE login_id = $1', [businessLoginId]);
      if (result.rows.length > 0) {
        const biz = result.rows[0].data;
        biz.ownerPassword = newPassword;
        await pool.query(
          'UPDATE auth_businesses SET owner_password = $1, data = $2 WHERE login_id = $3',
          [newPassword, JSON.stringify(biz), businessLoginId]
        );
      }
      return res.json({ success: true });
    }
    if (role === 'SUB_ADMIN') {
      const result = await pool.query('SELECT data FROM auth_sub_admins WHERE email = $1', [email]);
      if (result.rows.length > 0) {
        const sa = result.rows[0].data;
        sa.password = newPassword;
        await pool.query(
          'UPDATE auth_sub_admins SET password = $1, data = $2 WHERE email = $3',
          [newPassword, JSON.stringify(sa), email]
        );
      }
      return res.json({ success: true });
    }
    if (role === 'SUB_MERCHANT') {
      const result = await pool.query('SELECT id, data FROM auth_businesses');
      for (const row of result.rows) {
        const biz = row.data;
        if (biz.subMerchantEmail === email) {
          biz.subMerchantPassword = newPassword;
          await pool.query('UPDATE auth_businesses SET data = $1 WHERE id = $2', [JSON.stringify(biz), row.id]);
          break;
        }
      }
      return res.json({ success: true });
    }
    res.json({ success: false });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

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

initAuthTables().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EmailServer] Running on port ${PORT} (${isProduction ? 'production' : 'development'})`);
  });
});
