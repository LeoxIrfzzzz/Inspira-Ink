import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data.json');

export type Quote = {
  id: string;
  text: string;
  author: string;
  mood: string;
};

let cachedQuotes: Quote[] | null = null;

export function getQuotes(): Quote[] {
  if (cachedQuotes) return cachedQuotes;
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    cachedQuotes = JSON.parse(data).map((q: any) => ({ ...q, id: q.id.toString() }));
    return cachedQuotes || [];
  } catch (err) {
    console.error("Error reading db", err);
    return [];
  }
}

export async function getQuoteById(id: string): Promise<Quote | null> {
  const quotes = getQuotes();
  return quotes.find(q => q.id === id) || null;
}

export async function getRandomQuoteByMood(mood: string): Promise<Quote | null> {
  const quotes = getQuotes();
  const filtered = quotes.filter(q => q.mood.toLowerCase() === mood.toLowerCase());
  if (filtered.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}

export async function saveQuote(text: string, author: string, mood: string): Promise<Quote> {
  const quotes = getQuotes();
  const maxId = quotes.reduce((max, q) => {
    const num = parseInt(q.id, 10);
    return !isNaN(num) && num > max ? num : max;
  }, 14049); 
  
  const newId = (maxId + 1).toString();
  const newQuote: Quote = { id: newId, text, author, mood };
  
  quotes.push(newQuote);
  
  try {
    fs.writeFileSync(dbPath, JSON.stringify(quotes));
  } catch (e) {
    // Read-only filesystem gracefully ignored
  }
  
  return newQuote;
}
