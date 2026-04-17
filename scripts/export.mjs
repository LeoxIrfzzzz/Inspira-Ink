import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';

async function run() {
  const dbPath = path.join(process.cwd(), 'inspira.db');
  const db = await open({ filename: dbPath, driver: sqlite3.Database });
  const rows = await db.all('SELECT * FROM quotes');
  fs.writeFileSync(path.join(process.cwd(), 'data.json'), JSON.stringify(rows));
  console.log("Exported 14049 rows to data.json!");
}
run();
