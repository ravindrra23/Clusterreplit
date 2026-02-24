import { pool } from "./server/db";
async function fix() {
  const client = await pool.connect();
  try {
    await client.query('ALTER TABLE clusters ADD COLUMN IF NOT EXISTS business_count INTEGER DEFAULT 0');
    console.log("Database fixed");
  } finally {
    client.release();
  }
}
fix().catch(console.error);
