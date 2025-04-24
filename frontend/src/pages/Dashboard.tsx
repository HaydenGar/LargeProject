
import React, { useState, useEffect } from 'react';
import './Dashboard.css';

interface Entry {
  EntryId:     number | null;
  EntryText:   string;
  DateCreated: string;
  Tags?:       string[];
}

interface UserData {
  id:        number;
  firstName: string;
}

const moodThemes: { [key: string]: React.CSSProperties } = {
  Default:    { backgroundColor: '#FFFFFF', color: '#000000' },
  Ecstatic:   { backgroundColor: '#c5debb', color: '#5d7055' },
  Happy:     { backgroundColor: '#fff9c4', color: '#6e6b4d' },
  Meh:      { backgroundColor: '#F9D4B2', color: '#735336' },
  Sad:      { backgroundColor: '#B4C9DD', color: '#334c65' },
  Angry: { backgroundColor: '#FFCFD2', color: '#755053' },
};


const Dashboard: React.FC = () => {
  /* Generate Prompts */
  const [user, setUser]           = useState<UserData | null>(null);
  const [entryText, setEntryText] = useState('');
  const [tagInput, setTagInput]   = useState('');
  const [tags, setTags]           = useState<string[]>([]);
  const [mood, setMood]           = useState('Default');
  const [message, setMessage]     = useState('');
  const [entries, setEntries]     = useState<Entry[]>([]);
  const prompts = [
    "What distractions get in the way of being your most productive?",
    "If someone described you, what would they say?",
    "What emotions are you holding on to?",
    "How have your current habits been serving you? Are there any that need to change?",
    "Who is pushing you to be the best version of yourself? Who is sabotaging your efforts?",
    "Why is your current lifestyle satisfactory? If it isn’t, why not?",
    "Who has had the greatest influence on your life? What did they do?",
    "Who has done a recent act of kindness for you? Who can you do a random act of kindness to today?",
    "Who is your personal role model? Why are they your role model?",
    "Who has invested in your well-being recently? Who could you invest in?",
    "When life gets overwhelming what do you do to regain composure?",
    "When was the last time you did an activity for only yourself? When can you do so again?",
    "What is your favorite time of the day and why?",
    "When have you exceeded your expectations? What did you do?",
    "What is your biggest regret? What is your greatest accomplishment?",
    "How would you behave if you didn’t care about other people’s expectations?",
    "Who has made you laugh recently? What did they do to make you laugh?",
    "Create a motto for your life.",
    "When was the last time you overcame a difficult obstacle? How were you able to beat it?",
    "Have you taken a day to disconnect from responsibilities? When was the last time you did so?"
  ];
  const [promptIndex, setPromptIndex] = useState(-1);
  const currentPrompt = prompts[promptIndex];

  const handleGeneratePrompt = () => {
    setPromptIndex((prev) => (prev + 1) % prompts.length);
  };

  /* Mood Emojis */
  const moodOptions = [
  { label: "Ecstatic", image: "/emojis/ecstatic.png" },
  { label: "Happy", image: "/emojis/happy.png" },
  { label: "Meh", image: "/emojis/meh.png" },
  { label: "Sad", image: "/emojis/sad.png" },
  { label: "Angry", image: "/emojis/angry.png" },
  ];

const moodToEmojiMap: { [key: string]: number } = {
  Ecstatic: 0,
  Happy:    1,
  Meh:      2,
  Sad:      3,
  Angry:    4,
};


  const [selectedMood, setSelectedMood] = useState<string | null>(null);

const handleMoodSelection = (mood: string) => {
  setSelectedMood(mood); // Update selected mood
};

  /* Horizontal bars */
  const [stressLevel, setStressLevel] = useState(0);
  const [sleepLevel, setSleepLevel] = useState(0);
  const [productivityLevel, setProductivityLevel] = useState(0);
  const [energyLevel, setEnergyLevel] = useState(0);

  const handleBarClick = (bar: string, event: React.MouseEvent) => {
    const barWidth = event.currentTarget.offsetWidth;
    const clickPosition = event.nativeEvent.offsetX;
    const newValue = Math.round((clickPosition / barWidth) * 10);

    switch (bar) {
      case 'stress':
        setStressLevel(newValue);
        break;
      case 'sleep':
        setSleepLevel(newValue);
        break;
      case 'productivity':
        setProductivityLevel(newValue);
        break;
      case 'energy':
        setEnergyLevel(newValue);
        break;
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('user_data');
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      fetchEntries(u.id);
    }
  }, []);

  const fetchEntries = async (userId: number) => {
    try {
      const res = await fetch('/api/getEntries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: { UserId: userId } })
      });
      const { entries: data } = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch entries', e);
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags(prev => [...prev, t]);
      setTagInput('');
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user) return;

  const emoji = selectedMood ? moodToEmojiMap[selectedMood] : -1;

  try {
    const res = await fetch('/api/createEntry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: { UserId: user.id },
        entryText,
        tags,
        emoji,
        energy: energyLevel,
        productivity: productivityLevel,
        sleep: sleepLevel,
        stress: stressLevel
      }),
    });
    const data = await res.json();
    if (data.EntryId > 0) {
      setMessage('Entry saved!');
      setEntryText('');
      setTags([]);
      setSelectedMood(null); // reset mood
      setEnergyLevel(0);
      setProductivityLevel(0);
      setSleepLevel(0);
      setStressLevel(0);
      fetchEntries(user.id);
    } else {
      setMessage('Save failed: ' + (data.error || 'Unknown'));
    }
  } catch (err: any) {
    setMessage('Error: ' + err.toString());
  }
};


  return (
    <div className="dashboard" style={moodThemes[selectedMood] || moodThemes.Default}>
      <header className="dashboard-header" style={moodThemes[selectedMood] || moodThemes.Default}>
        <h1>Welcome{user ? `, ${user.firstName}` : ''}!</h1>
      </header>
     <main className="dashboard-main" style={moodThemes[selectedMood] || moodThemes.Default}>
        <section className="new-entry">
          <form className="entry-form" onSubmit={handleSubmit}>
            <textarea
              placeholder="What’s on your mind?"
              value={entryText}
              onChange={e => setEntryText(e.target.value)}
            />

            <div className="tag-input" style={moodThemes[selectedMood] || moodThemes.Default}>
              <input
                type="text"
                placeholder="Add a tag"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
              />
                           <button
                      type="button"
                      onClick={addTag}
                      style={moodThemes[selectedMood] || moodThemes.Default}>
          Add Tag
         </button>
            </div>

            <div className="tag-list" style={moodThemes[selectedMood] || moodThemes.Default}>
              {tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>

            <button
  type="submit"
  className="save-button"
  style={moodThemes[selectedMood] || moodThemes.Default}
>
  Save Entry
          </button>
          </form>
          {message && <p className="message">{message}</p>}
        </section>

        {/* Generate Prompt section */}
        <section id="prompt-tools" className="entry-list">
          <div className="prompt-box" onClick={handleGeneratePrompt}>
             {promptIndex === -1 ? "Generate a prompt 💭" : currentPrompt}
          </div>

         {/* Mood emoji section */}
         <div className="mood-emoji-selector">
            <div className="mood-label">Mood:</div>
            <div className="mood-icons-container">
              {moodOptions.map((mood) => (
                <div
                  key={mood.label}
                  className={`mood-icon-container ${selectedMood === mood.label ? "selected" : ""}`}
                  onClick={() => handleMoodSelection(mood.label)}
                >
                <img
                  src={mood.image}
                  alt={mood.label}
                  className="mood-icon"
                />
              </div>
            ))}
            </div>
          </div>
<div className="rating-bars">
  {[
    { label: "Energy", value: energyLevel, setter: setEnergyLevel, color: "#16D67C" },
    { label: "Productivity", value: productivityLevel, setter: setProductivityLevel, color: "#FFAEC9" },
    { label: "Stress", value: stressLevel, setter: setStressLevel, color: "#A349A4" },
    { label: "Sleep", value: sleepLevel, setter: setSleepLevel, color: "#1464E3" },
  ].map(({ label, value, setter, color }) => (
    <div key={label} className="rating-bar">
      <label>{label}</label>
      <div
        className="bar-container"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const width = rect.width;
          const newLevel = Math.ceil((clickX / width) * 5);
          setter(newLevel);
        }}
      >
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`bar-segment ${level <= value ? "active" : ""}`}
            style={{ backgroundColor: level <= value ? color : "#ddd" }}
          />
        ))}
      </div>
    </div>
  ))}
</div>

        </section>
      </main>
    </div>
  );
};

export default Dashboard;
