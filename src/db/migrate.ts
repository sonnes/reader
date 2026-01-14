import { getDatabase } from "./index";
import { SCHEMA, INDEXES } from "./schema";

export function runMigrations(): void {
  const db = getDatabase();

  console.log("Running database migrations...");

  // Create tables in order (folders first due to foreign key dependencies)
  const tableOrder: (keyof typeof SCHEMA)[] = [
    "feeds",
    "folders",
    "entries",
    "subscriptions",
    "read_status",
    "starred",
  ];

  for (const table of tableOrder) {
    db.run(SCHEMA[table]);
    console.log(`  ✓ Table '${table}' ready`);
  }

  // Create indexes
  for (const indexSql of INDEXES) {
    db.run(indexSql);
  }
  console.log(`  ✓ ${INDEXES.length} indexes created`);

  console.log("Database migrations complete.");
}
