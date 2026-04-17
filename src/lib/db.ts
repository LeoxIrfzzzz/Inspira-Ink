import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data.json');

export type Quote = {
  id: string;
  text: string;
  author: string;
  mood: string;
};

export function getQuotes(): Quote[] {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8');
    const json = JSON.parse(data);
    return json.quotes || [];
  } catch (error) {
    return [];
  }
}

export function saveQuote(quote: Quote) {
  const quotes = getQuotes();
  quotes.push(quote);
  fs.writeFileSync(dbPath, JSON.stringify({ quotes }, null, 2));
}
