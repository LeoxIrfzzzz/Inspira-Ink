import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MOODS = ['Happy', 'Sad', 'Inspired', 'Angry', 'Calm', 'Anxious', 'Romantic'];

const baseQuotes = {
  'Happy': "The sky is bright and the heart feels light.",
  'Sad': "Like rain on a window pane, the tears fall softly.",
  'Inspired': "Look to the sky blue horizon and paint your dreams.",
  'Angry': "A dark storm brews in the deep inky blue depths.",
  'Calm': "Still waters run deep beneath a peaceful sky.",
  'Anxious': "Winds howl through the mind's uncertain pathways.",
  'Romantic': "Stars shine brightest against the darkest canvas."
};

async function seed() {
  const dbPath = path.join(__dirname, '..', 'inspira.db');
  console.log("Creating database at:", dbPath);
  
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT,
      author TEXT,
      mood TEXT
    )
  `);

  await db.exec(`DELETE FROM quotes`);
  await db.exec(`DELETE FROM sqlite_sequence WHERE name='quotes'`);

  console.log("Seeding 2007 quotes for each of the 7 moods. 14,049 records total...");

  let values = [];
  for (const mood of MOODS) {
    const base = baseQuotes[mood];
    for (let i = 1; i <= 2007; i++) {
        values.push([`${base} (Inscription ${i})`, "Inspira Ink Scribe", mood]);
    }
  }

  const chunkSize = 500;
  for (let i = 0; i < values.length; i += chunkSize) {
    const chunk = values.slice(i, i + chunkSize);
    const placeholders = chunk.map(() => '(?, ?, ?)').join(',');
    const flatVars = chunk.flat();
    await db.run(`INSERT INTO quotes (text, author, mood) VALUES ${placeholders}`, flatVars);
  }

  const count = await db.get("SELECT COUNT(*) as count FROM quotes");
  console.log(`Successfully seeded ${count.count} quotes! Next quote submitted will be #${count.count + 1}`);
}

seed().catch(console.error);
