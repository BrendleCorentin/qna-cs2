import React, { useState, useEffect } from 'react';

export default function QuestionCard({
  type = 'mcq',
  question,
  choices,
  disabled,
  selectedIndex,
  onSelect,
}) {
  const [textAnswer, setTextAnswer] = useState("");

  // Reset input when question changes
  useEffect(() => {
    setTextAnswer("");
  }, [question]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (textAnswer.trim()) {
      onSelect(textAnswer);
    }
  };

  return (
    <div className="cs-question-card">
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem', whiteSpace: 'pre-wrap' }}>{question}</h2>

      {type === 'text' ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: '0 auto' }}>
          <input
            type="text"
            className="cs-input"
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            disabled={disabled}
            placeholder="Tapez votre réponse ici..."
            autoFocus
            style={{ 
                padding: '1rem', 
                fontSize: '1.2rem', 
                textAlign: 'center',
                border: '2px solid var(--cs-accent)',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white'
             }}
          />
          <button 
            type="submit" 
            className="cs-btn" 
            disabled={disabled || !textAnswer.trim()}
            style={{ padding: '1rem' }}
          >
            VALIDER
          </button>
          
          {disabled && (
              <div style={{ marginTop: '0.5rem', color: 'var(--cs-text-muted)', fontSize: '0.9rem' }}>
                  Réponse envoyée. Attente du résultat...
              </div>
          )}
        </form>
      ) : (
        <div className="cs-choice-grid">
            {(choices || []).map((c, i) => { // Handle null choices safely
            const selected = selectedIndex === i;
            return (
                <button
                key={i}
                className={`cs-choice-btn ${selected ? "selected" : ""}`}
                disabled={disabled}
                onClick={() => onSelect(i)}
                >
                <span className="cs-label" style={{ marginBottom: 0 }}>{String.fromCharCode(65 + i)}.</span> {c}
                </button>
            );
            })}
        </div>
      )}
    </div>
  );
}
