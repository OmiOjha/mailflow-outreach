import mysql from 'mysql2/promise';
import env from './env';

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// quick connectivity check
export async function testConnection(): Promise<void> {
  try {
    const conn = await pool.getConnection();
    console.log('✓ MySQL connected');
    conn.release();
  } catch (err) {
    console.error('✗ MySQL connection failed:', (err as Error).message);
    throw err;
  }
}

export default pool;
