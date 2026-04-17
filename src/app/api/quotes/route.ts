import { NextResponse } from 'next/server';
import { getQuoteById, getRandomQuoteByMood, saveQuote } from '@/lib/db';

function isValidGrammar(sentence: string) {
  if (!sentence || sentence.length < 5) return false;
  const startsWithCapital = /^[A-Z]/.test(sentence);
  const endsWithPunctuation = /[.!?]$/.test(sentence.trim());
  const hasRepeatingChars = /(.)\1{3,}/.test(sentence);
  return startsWithCapital && endsWithPunctuation && !hasRepeatingChars;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mood = searchParams.get('mood');
  const quoteId = searchParams.get('id');
  
  if (quoteId) {
    const quote = await getQuoteById(quoteId);
    if (quote) return NextResponse.json(quote);
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
  }

  if (mood) {
    const quote = await getRandomQuoteByMood(mood);
    if (quote) return NextResponse.json([quote]);
    return NextResponse.json([]);
  }
  
  return NextResponse.json([]);
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
        error: 'Please give it with the correct grammar (Start with an uppercase letter, end with proper punctuation, meaningful sentence).' 
      }, { status: 400 });
    }
    
    const newQuote = await saveQuote(text, author, mood);
    
    return NextResponse.json(newQuote, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
