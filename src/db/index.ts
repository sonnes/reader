import { Database } from 'bun:sqlite'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

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
  }
  return db
}

export function closeDb() {
  if (db) {
    db.close()
    db = null
  }
}
