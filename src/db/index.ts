import { Database } from "bun:sqlite";

let db: Database | null = null;

export function getDatabase(): Database {
  if (!db) {
    db = new Database("reader.db");
    // Enable WAL mode for better concurrent access
    db.exec("PRAGMA journal_mode = WAL");
    db.exec("PRAGMA foreign_keys = ON");
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
