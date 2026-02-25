import React from 'react';

export default function QuestionCard({
  question,
  choices,
  disabled,
  selectedIndex,
  onSelect,
}) {
  return (
    <div className="cs-question-card">
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>{question}</h2>

      <div className="cs-choice-grid">
        {choices.map((c, i) => {
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
    </div>
  );
}
