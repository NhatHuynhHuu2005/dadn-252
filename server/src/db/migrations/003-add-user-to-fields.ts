import { getPool } from '../mssql-connection.js';

export async function runMigration003() {
  const pool = await getPool();
  
  console.log('🚀 Running migration 003: Add userId to fields table...');
  
  try {
    // Check if column already exists
    const checkResult = await pool.request().query(`
      IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'fields' AND COLUMN_NAME = 'userId'
      )
      BEGIN
        ALTER TABLE fields ADD userId VARCHAR(50);
        
        -- Add foreign key constraint
        ALTER TABLE fields 
        ADD CONSTRAINT FK_Fields_Users 
        FOREIGN KEY (userId) REFERENCES users(id);
        
        PRINT 'Column userId added to fields table';
      END
      ELSE
      BEGIN
        PRINT 'Column userId already exists in fields table';
      END
    `);
    
    console.log('✅ Migration 003 completed');
  } catch (error) {
    console.error('❌ Migration 003 failed:', error);
    throw error;
  }
}
