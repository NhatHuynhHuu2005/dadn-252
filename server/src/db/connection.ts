import { getPool } from './mssql-connection.js';

/**
 * Execute INSERT, UPDATE, or DELETE queries
 * Returns the number of rows affected
 */
export async function runAsync(
  query: string,
  params?: any[]
): Promise<number> {
  try {
    const pool = await getPool();
    const request = pool.request();

    // Add parameters
    if (params) {
      params.forEach((param, index) => {
        request.input(`p${index}`, param);
      });

      // Replace ? with @p0, @p1, etc.
      let paramIndex = 0;
      query = query.replace(/\?/g, () => `@p${paramIndex++}`);
    }

    const result = await request.query(query);
    return result.rowsAffected[0] || 0;
  } catch (error) {
    console.error('runAsync error:', error);
    throw error;
  }
}

/**
 * Execute SELECT query and return first row
 */
export async function getAsync<T = any>(
  query: string,
  params?: any[]
): Promise<T | null> {
  try {
    const pool = await getPool();
    const request = pool.request();

    // Add parameters
    if (params) {
      params.forEach((param, index) => {
        request.input(`p${index}`, param);
      });

      let paramIndex = 0;
      query = query.replace(/\?/g, () => `@p${paramIndex++}`);
    }

    const result = await request.query(query);
    return (result.recordset[0] as T) || null;
  } catch (error) {
    console.error('getAsync error:', error);
    throw error;
  }
}

/**
 * Execute SELECT query and return all rows
 */
export async function allAsync<T = any>(
  query: string,
  params?: any[]
): Promise<T[]> {
  try {
    const pool = await getPool();
    const request = pool.request();

    // Add parameters
    if (params) {
      params.forEach((param, index) => {
        request.input(`p${index}`, param);
      });

      let paramIndex = 0;
      query = query.replace(/\?/g, () => `@p${paramIndex++}`);
    }

    const result = await request.query(query);
    return (result.recordset as T[]) || [];
  } catch (error) {
    console.error('allAsync error:', error);
    throw error;
  }
}

export default { getPool, runAsync, getAsync, allAsync };
