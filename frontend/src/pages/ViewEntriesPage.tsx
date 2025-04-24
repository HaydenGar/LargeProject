import React, { useState, useEffect } from 'react';
import './ViewEntriesPage.css';

interface Entry {
    EntryId:     number;
    EntryText:   string;
    DateCreated: string;
    Tags?:       string[];
    Emoji:       number;
    Energy:      number;
    Productivity:number;
    Sleep:       number;
    Stress:      number;
  }


/* mood emojis */
const emojiMap: Record<number, string> = {
    0: '/emojis/ecstatic.png',
    1: '/emojis/happy.png',
    2: '/emojis/meh.png',
    3: '/emojis/sad.png',
    4: '/emojis/angry.png'
  };


const ViewEntriesPage: React.FC = () => {
  const [entries, setEntries]       = useState<Entry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEntries = async () => {
    const stored = localStorage.getItem('user_data');
    const userId = stored ? JSON.parse(stored).id : null;
    if (!userId) return;
    try {
      const res = await fetch('/api/getEntries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: { UserId: userId } })
      });
      const { entries: data } = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Fetch error', e);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleDelete = async (entryId: number) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      const res = await fetch('/api/deleteEntry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId })
      });
      const data = await res.json();
      if (data.EntryId === entryId) {
        setEntries(prev => prev.filter(e => e.EntryId !== entryId));
      } else {
        alert('Delete failed: ' + (data.error || 'Unknown'));
      }
    } catch (e) {
      console.error('Delete error', e);
      alert('Error deleting entry');
    }
  };

  const filtered = entries.filter(e => {
    const term = searchTerm.toLowerCase();
    return (
      e.EntryText.toLowerCase().includes(term) ||
      (e.Tags ?? []).some(tag => tag.toLowerCase().includes(term))
    );
  });

  return (
    <div className="view-entries-page">
      <header>
        <h1>Your Journal Entries</h1>
      </header>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by text or tag…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="entries-list">
        {filtered.length === 0 && (
          <p className="no-results">
            {searchTerm ? 'No matching entries.' : 'No entries yet.'}
          </p>
        )}

        {filtered.map((entry, idx) => (
          <div key={`${entry.EntryId}-${idx}`} className="entry-card">
            <div className="entry-meta">
              <span className="entry-date">
                {new Date(entry.DateCreated).toDateString()}
              </span>
            </div>

            <p className="entry-text">{entry.EntryText}</p>

            <div className="entry-stats">
  <div className="entry-emoji">
    <img
      src={emojiMap[entry.Emoji]}
      alt="Mood emoji"
      className="emoji-img"
    />
  </div>

  <div className="entry-bars">
  <div className="bar-grid">
    <div className="bar-column">
      {[
        { label: 'Energy', value: entry.Energy, color: '#16D67C' },
        { label: 'Productivity', value: entry.Productivity, color: '#FFAEC9' }
      ].map(({ label, value, color }) => (
        <div className="rating-bar" key={label}>
          <div className="bar-label">{label}</div>
          <div className="bar-container">
            {[1, 2, 3, 4, 5].map(level => (
              <div
                key={level}
                className="bar-segment"
                style={{ backgroundColor: level <= value ? color : '#ddd' }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
    <div className="bar-column">
      {[
        { label: 'Sleep', value: entry.Sleep, color: '#1464E3' },
        { label: 'Stress', value: entry.Stress, color: '#A349A4' }
      ].map(({ label, value, color }) => (
        <div className="rating-bar" key={label}>
          <div className="bar-label">{label}</div>
          <div className="bar-container">
            {[1, 2, 3, 4, 5].map(level => (
              <div
                key={level}
                className="bar-segment"
                style={{ backgroundColor: level <= value ? color : '#ddd' }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
</div>


</div>



            {entry.Tags && entry.Tags.length > 0 && (
              <div className="entry-tags">
                {entry.Tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <button
              className="delete-button"
              onClick={() => handleDelete(entry.EntryId)}
              aria-label="Delete entry"
            >
              ✖
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewEntriesPage;
