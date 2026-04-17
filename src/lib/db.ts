import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data.json');
const KV_URL = 'https://kvdb.io/Ss37nTvryCU1683pLyEjo9/quotes';

export type Quote = {
  id: string;
  text: string;
  author: string;
  mood: string;
};

let baseQuotes: Quote[] | null = null;
let newQuotesCache: Quote[] = [];

export async function getQuotes(): Promise<Quote[]> {
  if (!baseQuotes) {
    try {
      const data = fs.readFileSync(dbPath, 'utf8');
      baseQuotes = JSON.parse(data).map((q: any) => ({ ...q, id: q.id.toString() }));
    } catch {
      baseQuotes = [];
    }
  }

  try {
    const res = await fetch(KV_URL, { cache: 'no-store' });
    if (res.ok) {
      newQuotesCache = await res.json() || [];
    }
  } catch (e) {
  }

  return [...baseQuotes!, ...newQuotesCache];
}

export async function getQuoteById(id: string): Promise<Quote | null> {
  const quotes = await getQuotes();
  return quotes.find(q => q.id === id) || null;
}

export async function getRandomQuoteByMood(mood: string): Promise<Quote | null> {
  const quotes = await getQuotes();
  const filtered = quotes.filter(q => q.mood.toLowerCase() === mood.toLowerCase());
  if (filtered.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}

export async function saveQuote(text: string, author: string, mood: string): Promise<Quote> {
  const quotes = await getQuotes();
  const maxId = quotes.reduce((max, q) => {
    const num = parseInt(q.id, 10);
    return !isNaN(num) && num > max ? num : max;
  }, 14049); 
  
  const newId = (maxId + 1).toString();
  const newQuote: Quote = { id: newId, text, author, mood };
  
  const updatedNewQuotes = [...newQuotesCache, newQuote];
  
  try {
     await fetch(KV_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNewQuotes)
     });
     newQuotesCache = updatedNewQuotes;
  } catch (e) {
     console.error(e);
  }
  
  return newQuote;
}
