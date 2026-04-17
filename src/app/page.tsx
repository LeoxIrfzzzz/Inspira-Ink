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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <a href="/" className="title-link">
            <h1 className="title" style={{ marginBottom: 0 }}>
              <Feather size={40} /> Inspira Ink
            </h1>
          </a>
          
          <form onSubmit={handleSearch} className="search-form">
            <input 
              type="number" 
              placeholder="Search Quote #..." 
              className="search-input"
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
            />
            <button type="submit" className="search-btn">
              <Search size={18} />
            </button>
          </form>
        </div>
        
        {searchError && <div className="error-message" style={{marginBottom: '1rem', padding: '0.5rem'}}>{searchError}</div>}
        <p className="subtitle">The World&apos;s Spot for Writers. Give us your lines.</p>
      </header>

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
      
      <footer style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--ink-text-muted)', fontSize: '0.9rem', borderTop: '1px solid var(--ink-tertiary)', marginTop: '2rem', fontFamily: 'var(--font-sans)' }}>
        Built by the writer <strong style={{ color: 'var(--ink-text)' }}>Mohammed Irfaan Zayn</strong> with <Heart size={14} style={{ display: 'inline', color: 'var(--ink-highlight)', margin: '0 4px', position: 'relative', top: '2px' }}/> Love.
      </footer>
    </main>
  );
}
