/**
 * One-shot: apply tracking/email flag columns via Postgres connection string.
 * Usage: node scripts/apply-tracking-migration.cjs
 * Needs DATABASE_URL or SUPABASE_DB_URL in .env (Settings → Database → URI).
 */
const { readFileSync, existsSync } = require('fs')
const { resolve } = require('path')

function loadEnv(path) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    if (!process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
    }
  }
}

async function main() {
  loadEnv(resolve(__dirname, '../.env'))
  const dbUrl =
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.POSTGRES_URL ||
    ''
  if (!dbUrl) {
    console.error(
      'Missing DATABASE_URL. Add the Supabase Postgres URI to .env, or run the SQL in the Supabase SQL editor:',
    )
    console.error(
      '  supabase/migrations/20260915120000_orders_tracking_email_flags.sql',
    )
    process.exit(1)
  }

  let pg
  try {
    pg = require('pg')
  } catch {
    console.error('Install pg first: npm i -D pg')
    process.exit(1)
  }

  const sql = readFileSync(
    resolve(
      __dirname,
      '../supabase/migrations/20260915120000_orders_tracking_email_flags.sql',
    ),
    'utf8',
  )
  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()
  try {
    await client.query(sql)
    console.log('Migration applied: tracking + email flags on orders')
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
