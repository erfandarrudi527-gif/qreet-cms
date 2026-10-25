import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Postgres from "embedded-postgres";

/**
 * Local embedded PostgreSQL #2 for Qreet CMS (port 5433).
 * Data lives in ./data/pgdata — completely separate from Qreet Main.
 *
 * Usage: npm run db:local   (keep it running, then `npm run dev` in another terminal)
 */
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dataDir = path.join(root, "data", "pgdata");

const postgres = new Postgres({
  databaseDir: dataDir,
  user: "postgres",
  password: "postgres",
  port: 5433,
  persistent: true,
  // Persian_Iran.1256 locale crashes embedded initdb — force C + UTF8.
  initdbFlags: ["--locale=C", "--encoding=UTF8"],
});

if (!fs.existsSync(path.join(dataDir, "PG_VERSION"))) {
  console.log("[db] Initialising embedded PostgreSQL in", dataDir);
  fs.mkdirSync(dataDir, { recursive: true });
  await postgres.initialise();
}

await postgres.start();
console.log("[db] Embedded PostgreSQL running on localhost:5433");

// Ensure the qreet_cms database exists (created as UTF8 regardless of cluster defaults)
const client = postgres.getPgClient("postgres");
await client.connect();
const db = "qreet_cms";
const exists = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [db]);
if (exists.rowCount === 0) {
  await client.query(
    `CREATE DATABASE ${db} WITH ENCODING 'UTF8' LC_COLLATE 'C' LC_CTYPE 'C' TEMPLATE template0`
  );
  console.log("[db] Created database", db);
} else {
  console.log("[db] Database", db, "already exists");
}
await client.end();

console.log("[db] Ready. Stop with Ctrl+C.");
process.on("SIGINT", () => process.exit(0));
