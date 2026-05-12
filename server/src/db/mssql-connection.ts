<<<<<<< HEAD
=======
import 'dotenv/config';
>>>>>>> khanh
import sql from 'mssql';

const sqlConfig: sql.config = {
  server: process.env.MSSQL_SERVER || 'localhost',
  database: process.env.MSSQL_DATABASE || 'smartfarm_db',
  authentication: {
    type: 'default',
    options: {
      userName: process.env.MSSQL_USER || 'sa',
<<<<<<< HEAD
      password: process.env.MSSQL_PASSWORD || 'nhathuynh2005',
=======
      password: process.env.MSSQL_PASSWORD || '04050607@',
>>>>>>> khanh
    }
  },
  options: {
    trustServerCertificate: true,
    encrypt: true,
    connectTimeout: 15000,
  }
};

let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (pool) {
    return pool;
  }

  try {
    pool = new sql.ConnectionPool(sqlConfig);
    await pool.connect();
    console.log('✅ Connected to MSSQL database');
    return pool;
  } catch (error) {
    console.error('❌ MSSQL connection failed:', error);
    throw error;
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
  }
}

<<<<<<< HEAD
export default sql;
=======
export default sql;
>>>>>>> khanh
