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
    if (activeMood) {
      fetchQuote(activeMood);
    }
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
      <header className="header" style={{ marginBottom: '3rem' }}>
        <a href="/" className="title-link">
          <img 
            src="/banner.jpg" 
            alt="Inspira Ink - The work spot for writers" 
            style={{ 
              width: '100%', 
              maxWidth: '600px', 
              height: 'auto', 
              borderRadius: '12px', 
              boxShadow: '0 0 30px rgba(81, 112, 255, 0.2)',
              border: '1px solid var(--theme-blue)'
            }} 
          />
        </a>
      </header>

      <section className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input 
            type="number" 
            placeholder="Enter quote number..." 
            className="search-input"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
          />
          <button type="submit" className="search-btn" aria-label="Search">
            <Search size={18} /> <span className="btn-text">Search</span>
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

        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <button 
            className="share-btn-global" 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Inspira Ink',
                  text: 'Step into the Inky Sanctuary—Explore thousands of quotes by Mohammed Irfaan Zayn and immortalize your own lines.',
                  url: window.location.href
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard! Share the love. ♡');
              }
            }}
          >
            Share this page with love ♡ ✨
          </button>
        </div>
      </section>
      
      <section className="info-section">
        <h2 className="section-title">About Inspira Ink</h2>
        <div className="info-grid">
          <div className="info-card">
            <QuoteIcon size={24} style={{ marginBottom: '1.25rem' }} />
            <h3>7 Emotional Realms</h3>
            <p>Step into 7 unique feeling moods carefully curated for every emotional state: Happy, Sad, Inspired, Angry, Calm, Anxious, and Romantic.</p>
          </div>
          <div className="info-card">
            <Sparkles size={24} style={{ marginBottom: '1.25rem' }} />
            <h3>14,049 Original Lines</h3>
            <p>Our library features 2,007 original quotes for each mood (totaling 14,049 lines), all exclusively scribed by the writer <strong>Mohammed Irfaan Zayn</strong>.</p>
          </div>
          <div className="info-card">
            <Stars size={24} style={{ marginBottom: '1.25rem' }} />
            <h3>Permanent Inscriptions</h3>
            <p>Every new quote you contribute is saved with a unique number and stored permanently. Your lines will never be deleted, even when the application is updated.</p>
          </div>
          <div className="info-card">
            <Send size={24} style={{ marginBottom: '1.25rem' }} />
            <h3>Cross-Device Sanctuary</h3>
            <p>Use your unique quote number to find your lines on any device, anywhere in the world. Inspira Ink is your immortal digital archive for the soul.</p>
          </div>
        </div>
      </section>

      <footer>
        Built by the writer <strong>Mohammed Irfaan Zayn</strong> with <Heart size={14} style={{ display: 'inline', color: 'var(--blue)', margin: '0 4px', position: 'relative', top: '2px' }}/> Love.
      </footer>
    </main>
  );
}
