import { NextResponse } from 'next/server';
import { getQuotes, saveQuote, Quote } from '@/lib/db';

function isValidGrammar(sentence: string) {
  if (!sentence || sentence.length < 5) return false;
  // Basic grammar check: 
  // 1. Starts with a capital letter
  const startsWithCapital = /^[A-Z]/.test(sentence);
  // 2. Ends with punctuation (., !, ?)
  const endsWithPunctuation = /[.!?]$/.test(sentence.trim());
  // 3. Meaningful string: Avoid consecutive repeated chars like "hhhh"
  const hasRepeatingChars = /(.)\1{3,}/.test(sentence);
  
  return startsWithCapital && endsWithPunctuation && !hasRepeatingChars;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mood = searchParams.get('mood');
  const quoteId = searchParams.get('id');
  const allQuotes = getQuotes();
  
  if (quoteId) {
    const quote = allQuotes.find(q => q.id === quoteId);
    if (quote) return NextResponse.json(quote);
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
  }

  if (mood) {
    const filtered = allQuotes.filter(q => q.mood.toLowerCase() === mood.toLowerCase());
    return NextResponse.json(filtered);
  }
  
  return NextResponse.json(allQuotes);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, author, mood } = body;
    
    if (!text || !author || !mood) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    if (!isValidGrammar(text)) {
      return NextResponse.json({ 
        error: 'Please give it with the correct grammar (Start with an uppercase letter, end with proper punctuation like . ! or ?, and ensure the sentence is meaningful).' 
      }, { status: 400 });
    }
    
    const currentQuotes = getQuotes();
    const maxId = currentQuotes.reduce((max, q) => {
      const num = parseInt(q.id, 10);
      return !isNaN(num) && num > max ? num : max;
    }, 2007);
    
    const newQuote: Quote = {
      id: (maxId + 1).toString(),
      text,
      author,
      mood,
    };
    
    saveQuote(newQuote);
    
    return NextResponse.json(newQuote, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
