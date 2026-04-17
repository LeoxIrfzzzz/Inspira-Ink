import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

const dbPath = path.join(process.cwd(), 'inspira.db');

export type Quote = {
  id: string;
  text: string;
  author: string;
  mood: string;
};

let dbPromise: Promise<Database> | null = null;

export async function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = open({
      filename: dbPath,
      driver: sqlite3.Database
    });
  }
  return dbPromise;
}

export async function getQuoteById(id: string): Promise<Quote | null> {
  const db = await getDb();
  const raw = await db.get('SELECT * FROM quotes WHERE id = ?', [id]);
  if (raw) return { ...raw, id: raw.id.toString() };
  return null;
}

export async function getRandomQuoteByMood(mood: string): Promise<Quote | null> {
  const db = await getDb();
  const raw = await db.get('SELECT * FROM quotes WHERE mood = ? COLLATE NOCASE ORDER BY RANDOM() LIMIT 1', [mood]);
  if (raw) return { ...raw, id: raw.id.toString() };
  return null;
}

export async function saveQuote(text: string, author: string, mood: string): Promise<Quote> {
  const db = await getDb();
  const result = await db.run('INSERT INTO quotes (text, author, mood) VALUES (?, ?, ?)', [text, author, mood]);
  return {
    id: result.lastID!.toString(),
    text,
    author,
    mood
  };
}
