"use client";

import { useState, useEffect } from 'react';
import { Feather, Quote as QuoteIcon, Send, Heart, Frown, Sparkles, Flame, Coffee, Wind, Stars, Search } from 'lucide-react';

const MOODS = [
  { name: 'Happy', icon: Heart },
  { name: 'Sad', icon: Frown },
  { name: 'Inspired', icon: Sparkles },
  { name: 'Angry', icon: Flame },
  { name: 'Calm', icon: Coffee },
  { name: 'Anxious', icon: Wind },
  { name: 'Romantic', icon: Stars },
];

export default function InspiraInk() {
  const [activeMood, setActiveMood] = useState('Happy');
  const [quote, setQuote] = useState<{id?: string, text: string, author: string} | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({ text: '', author: '', mood: 'Happy' });
  const [formStatus, setFormStatus] = useState<{type: 'error' | 'success', message: string} | null>(null);
  
  const [searchId, setSearchId] = useState('');
  const [searchError, setSearchError] = useState('');

  const fetchQuote = async (mood: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quotes?mood=${mood}`);
      if (res.ok) {
        const quotes = await res.json();
        if (quotes.length > 0) {
          const randomIndex = Math.floor(Math.random() * quotes.length);
          setQuote(quotes[randomIndex]);
        } else {
          setQuote({ text: "Silence is sometimes the best answer.", author: "Inspira Ink" });
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuote(activeMood);
  }, [activeMood]);

  const handleMoodSelect = (mood: string) => {
    setActiveMood(mood);
    setSearchError('');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId) return;
    
    setLoading(true);
    setSearchError('');
    try {
      const res = await fetch(`/api/quotes?id=${searchId}`);
      if (res.ok) {
        const foundQuote = await res.json();
        setQuote(foundQuote);
        setActiveMood(''); // clear active mood so it doesn't look like we just fetched mood
      } else {
        setSearchError(`Quote #${searchId} not found.`);
      }
    } catch (e) {
      setSearchError('Error searching quote.');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus(null);
    
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setFormStatus({ type: 'error', message: data.error || 'Failed to submit quote' });
      } else {
        setFormStatus({ type: 'success', message: `Your lines have been immortalized! Your quote number is #${data.id}. You can search for this number to view it later.` });
        setFormData({ text: '', author: '', mood: formData.mood });
        // Auto-show their newly submitted quote
        setQuote(data);
        setActiveMood('');
      }
    } catch (e) {
      setFormStatus({ type: 'error', message: 'An unexpected error occurred.' });
    }
  };

  return (
    <main className="container">
      <header className="header">
        <a href="/" className="title-link">
          <h1 className="title">
            <Feather size={40} /> Inspira Ink
          </h1>
        </a>
        <p className="subtitle">The World&apos;s Spot for Writers. Give us your lines.</p>
      </header>

      <section className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input 
            type="number" 
            placeholder="Search by quote number (e.g., 42)..." 
            className="search-input"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
          />
          <button type="submit" className="search-btn" aria-label="Search">
            <Search size={20} />
          </button>
        </form>
      </section>

      {searchError && (
        <div className="error-message" style={{ maxWidth: '400px', margin: '0 auto 2rem', textAlign: 'center' }}>
          {searchError}
        </div>
      )}

      <section>
        <div className="mood-selector">
          {MOODS.map((m) => {
            const Icon = m.icon;
            const isActive = activeMood === m.name;
            return (
              <button
                key={m.name}
                className={`mood-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleMoodSelect(m.name)}
              >
                <Icon size={18} /> {m.name}
              </button>
            );
          })}
        </div>

        <div className="quote-display fade-in" key={quote?.text}>
          <QuoteIcon size={40} className="quote-icon" />
          
          {quote?.id && !loading && (
            <div className="quote-number badge">#{quote.id}</div>
          )}

          {loading ? (
            <div className="quote-text">Scribing the perfect lines...</div>
          ) : (
            <>
              <div className="quote-text">{quote?.text ? `"${quote.text}"` : ""}</div>
              <div className="quote-author">{quote?.author}</div>
            </>
          )}
        </div>
      </section>

      <section className="submission-section">
        <h2 className="section-title">Contribute Your Lines</h2>
        
        {formStatus && (
          <div className={formStatus.type === 'error' ? 'error-message' : 'success-message'}>
            {formStatus.message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Your Lines</label>
            <textarea
              className="form-textarea"
              placeholder="Write a meaningful quote... (e.g. Start with an uppercase letter, end with proper punctuation)"
              value={formData.text}
              onChange={(e) => setFormData({...formData, text: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Writer&apos;s Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Your Name or Pen Name"
              value={formData.author}
              onChange={(e) => setFormData({...formData, author: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Quote Mood</label>
            <select
              className="form-select"
              value={formData.mood}
              onChange={(e) => setFormData({...formData, mood: e.target.value})}
            >
              {MOODS.map(m => (
                <option key={m.name} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>
          
          <button type="submit" className="submit-btn" title="Save your quote permanently to the database">
            <Send size={20} /> Immortalize Quote
          </button>
        </form>
      </section>
      
      <section className="info-section">
        <h2 className="section-title">About Inspira Ink</h2>
        <div className="info-grid">
          <div className="info-card">
            <QuoteIcon size={24} style={{ marginBottom: '1rem' }} />
            <h3>Writer&apos;s Sanctuary</h3>
            <p>Inspira Ink is a minimalistic space dedicated to the weight of words. It is designed for those who believe that a single line can change a perspective.</p>
          </div>
          <div className="info-card">
            <Sparkles size={24} style={{ marginBottom: '1rem' }} />
            <h3>Mood-Based Curation</h3>
            <p>Whether you feel calm, anxious, or romantic, explore thousands of curated quotes that resonate with your current emotional state.</p>
          </div>
          <div className="info-card">
            <Stars size={24} style={{ marginBottom: '1rem' }} />
            <h3>Cross-Device Sync</h3>
            <p>Every quote you contribute is assigned a unique number. Simply search for that number on any device to retrieve your favorite lines instantly.</p>
          </div>
          <div className="info-card">
            <Send size={24} style={{ marginBottom: '1rem' }} />
            <h3>Immortalize Lines</h3>
            <p>Contributing is easy. Write your lines, choose a mood, and hit immortalize. Your words will stay in our digital ink for others to find.</p>
          </div>
        </div>
      </section>

      <footer>
        Built by the writer <strong>Mohammed Irfaan Zayn</strong> with <Heart size={14} style={{ display: 'inline', color: 'var(--blue)', margin: '0 4px', position: 'relative', top: '2px' }}/> Love.
      </footer>
    </main>
  );
}
