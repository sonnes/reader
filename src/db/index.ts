import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Database } from 'bun:sqlite'

const __dirname = dirname(fileURLToPath(import.meta.url))

let db: Database | null = null

export function getDb(): Database {
  if (!db) {
    const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'reader.db')
    db = new Database(dbPath, { create: true })
    db.run('PRAGMA journal_mode = WAL')
    db.run('PRAGMA foreign_keys = ON')

    // Initialize schema
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8')
    db.run(schema)

    // Migration: Add is_deleted column if it doesn't exist
    const columns = db.query('PRAGMA table_info(articles)').all() as Array<{
      name: string
    }>
    const hasIsDeleted = columns.some((col) => col.name === 'is_deleted')
    if (!hasIsDeleted) {
      db.run(
        'ALTER TABLE articles ADD COLUMN is_deleted INTEGER NOT NULL DEFAULT 0',
      )
      db.run(
        'CREATE INDEX IF NOT EXISTS idx_articles_is_deleted ON articles(is_deleted)',
      )
    }
  }
  return db
}

export function closeDb() {
  if (db) {
    db.close()
    db = null
  }
}
