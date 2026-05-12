import { getPool } from '../mssql-connection.js';

/**
 * Migration 002: Add zoneCode to fields, add fieldId/triggeredBy/status to action_logs
 */
export async function runMigration002() {
  const pool = await getPool();

  // ── fields.zoneCode ──────────────────────────────────────────────
  await pool.request().query(`
    IF NOT EXISTS (
      SELECT 1 FROM sys.columns
      WHERE object_id = OBJECT_ID('fields') AND name = 'zoneCode'
    )
    ALTER TABLE fields ADD zoneCode NVARCHAR(20) NULL
  `);
  console.log('✅ fields.zoneCode column ready');

  // ── action_logs.fieldId ──────────────────────────────────────────
  await pool.request().query(`
    IF NOT EXISTS (
      SELECT 1 FROM sys.columns
      WHERE object_id = OBJECT_ID('action_logs') AND name = 'fieldId'
    )
    ALTER TABLE action_logs ADD fieldId NVARCHAR(50) NULL
  `);
  console.log('✅ action_logs.fieldId column ready');

  // ── action_logs.deviceId ─────────────────────────────────────────
  await pool.request().query(`
    IF NOT EXISTS (
      SELECT 1 FROM sys.columns
      WHERE object_id = OBJECT_ID('action_logs') AND name = 'deviceId'
    )
    ALTER TABLE action_logs ADD deviceId NVARCHAR(50) NULL
  `);
  console.log('✅ action_logs.deviceId column ready');

  // ── action_logs.triggeredBy ──────────────────────────────────────
  // Values: 'manual' | 'schedule' | 'threshold' | 'SYSTEM'
  await pool.request().query(`
    IF NOT EXISTS (
      SELECT 1 FROM sys.columns
      WHERE object_id = OBJECT_ID('action_logs') AND name = 'triggeredBy'
    )
    ALTER TABLE action_logs ADD triggeredBy NVARCHAR(20) NULL
  `);
  console.log('✅ action_logs.triggeredBy column ready');

  // ── action_logs.status ───────────────────────────────────────────
  // Values: 'success' | 'fail'
  await pool.request().query(`
    IF NOT EXISTS (
      SELECT 1 FROM sys.columns
      WHERE object_id = OBJECT_ID('action_logs') AND name = 'status'
    )
    ALTER TABLE action_logs ADD status NVARCHAR(10) NULL DEFAULT 'success'
  `);
  console.log('✅ action_logs.status column ready');

  // ── action_logs.category ─────────────────────────────────────────
  // Values: 'user' | 'device' — added if not present
  await pool.request().query(`
    IF NOT EXISTS (
      SELECT 1 FROM sys.columns
      WHERE object_id = OBJECT_ID('action_logs') AND name = 'category'
    )
    ALTER TABLE action_logs ADD category NVARCHAR(20) NULL DEFAULT 'user'
  `);
  console.log('✅ action_logs.category column ready');

  console.log('✅ Migration 002 completed');
}
