import { Database } from "bun:sqlite";
import { initializeDatabase, seedDatabase } from "./schema";
import { DataAccessLayer } from "./dal";

export { DataAccessLayer } from "./dal";
export type { Folder, Feed, Entry } from "./dal";

let db: Database | null = null;
let dal: DataAccessLayer | null = null;

export function getDatabase(): Database {
  if (!db) {
    db = new Database("reader.db");
    db.run("PRAGMA foreign_keys = ON");
    initializeDatabase(db);
    seedDatabase(db);
  }
  return db;
}

export function getDAL(): DataAccessLayer {
  if (!dal) {
    dal = new DataAccessLayer(getDatabase());
  }
  return dal;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    dal = null;
  }
}
