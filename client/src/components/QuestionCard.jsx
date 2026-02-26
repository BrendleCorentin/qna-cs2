import React, { useState, useEffect } from 'react';

export default function QuestionCard({
  type = 'mcq',
  question,
  choices,
  clues,
  timeLeft,
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

  if (type === 'progressive_clue') {
      const thresholds = [25, 15, 10, 5];
      // Clues logic:
      // Clue 1 (index 0): Show effectively immediately (when time <= 25, which is always true for 20s round)
      // Clue 2 (index 1): Show at 15s remaining
      // Clue 3 (index 2): Show at 10s remaining
      // Clue 4 (index 3): Show at 5s remaining

      return (
        <div className="cs-question-card">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>{question}</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2rem', textAlign: 'left', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
            {(clues || []).map((clue, i) => {
                const threshold = thresholds[i] !== undefined ? thresholds[i] : 0;
                // If timeLeft is high (e.g. 21), nothing shown? No, max 20.
                // At 20s: 20 <= 20 (Show 1). 20 <= 15 (False).
                const isVisible = timeLeft <= threshold;
                
                return (
                    <div key={i} style={{
                        opacity: isVisible ? 1 : 0.2,
                        filter: isVisible ? 'none' : 'blur(4px)',
                        transform: isVisible ? 'translateX(0)' : 'translateX(-10px)',
                        transition: 'all 0.5s ease',
                        padding: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        borderLeft: `4px solid ${isVisible ? 'var(--cs-accent)' : 'transparent'}`,
                        color: isVisible ? '#fff' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        minHeight: '50px' // preserve layout
                    }}>
                        <span>{isVisible ? clue : "Indice verrouillé..."}</span>
                        {!isVisible && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--cs-text-muted)' }}>
                                -{timeLeft - threshold}s
                            </span>
                        )}
                    </div>
                );
            })}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: '0 auto' }}>
            <input
                type="text"
                className="cs-input"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                disabled={disabled}
                placeholder="Qui suis-je ?"
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
                      {selectedIndex ? `Votre réponse : ${selectedIndex}` : "Temps écoulé"}
                  </div>
              )}
          </form>
        </div>
      );
  }

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
