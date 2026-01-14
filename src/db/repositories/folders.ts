import { getDatabase } from "../index";
import type { Folder } from "../types";

export function createFolder(name: string): Folder {
  const db = getDatabase();

  // Get the max sort_order and add 1
  const maxOrderStmt = db.prepare("SELECT MAX(sort_order) as max_order FROM folders");
  const result = maxOrderStmt.get() as { max_order: number | null };
  const nextOrder = (result.max_order ?? -1) + 1;

  const stmt = db.prepare(`
    INSERT INTO folders (name, sort_order)
    VALUES (?, ?)
  `);

  const insertResult = stmt.run(name, nextOrder);
  return getFolderById(Number(insertResult.lastInsertRowid))!;
}

function getFolderById(id: number): Folder | null {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM folders WHERE id = ?");
  return stmt.get(id) as Folder | null;
}

export function getFolders(): Folder[] {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM folders ORDER BY sort_order ASC");
  return stmt.all() as Folder[];
}

export function updateFolder(id: number, name: string): Folder {
  const db = getDatabase();
  const stmt = db.prepare("UPDATE folders SET name = ? WHERE id = ?");
  stmt.run(name, id);
  return getFolderById(id)!;
}

export function deleteFolder(id: number): void {
  const db = getDatabase();
  const stmt = db.prepare("DELETE FROM folders WHERE id = ?");
  stmt.run(id);
}

export function reorderFolders(folderIds: number[]): void {
  const db = getDatabase();
  const stmt = db.prepare("UPDATE folders SET sort_order = ? WHERE id = ?");

  for (let i = 0; i < folderIds.length; i++) {
    stmt.run(i, folderIds[i]);
  }
}
