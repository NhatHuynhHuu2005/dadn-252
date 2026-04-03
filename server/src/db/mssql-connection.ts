import sql from 'mssql';

const sqlConfig: sql.config = {
  server: process.env.MSSQL_SERVER || 'localhost',
  database: process.env.MSSQL_DATABASE || 'smartfarm_db',
  authentication: {
    type: 'default',
    options: {
      userName: process.env.MSSQL_USER || 'sa',
      password: process.env.MSSQL_PASSWORD || 'nhathuynh2005',
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

export default sql;
