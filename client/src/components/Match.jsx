import React, { useEffect, useState } from "react";
import QuestionCard from "./QuestionCard.jsx";

export default function Match({
  opponentName,
  questions,
  qIndex,
  deadline,
  answered,
  opponentAnswered,
  myScore,
  onAnswer,
  onLeave,
}) {
  const ROUND_DURATION_SECONDS = 10;
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!deadline) {
        setTimeLeft(0);
        return;
    }
    
    // Update immediately
    const update = () => {
        const diff = deadline - Date.now();
        setTimeLeft(Math.max(0, Math.ceil(diff / 1000)));
    };
    update();

    const interval = setInterval(update, 200);
    return () => clearInterval(interval);
  }, [deadline, qIndex]);

  const q = questions[qIndex];
  if (!q) return <div className="cs-container" style={{ justifyContent: 'center', textAlign: 'center' }}>Chargement du round...</div>;

  const my = answered[q.id];
  const selectedIndex = my?.answer;
  const correct = my?.correct;
  const oppDid = !!opponentAnswered[q.id];

  const isBot = opponentName === "Bot d'Entraînement";

  return (
    <div className="cs-container cs-match-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
           <div className="cs-label">ADVERSAIRE</div>
           <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{opponentName}</div>
           {!isBot && ( // Hide opponent indicator if bot/solo
               <>
                   <div className={`cs-status-dot ${oppDid ? 'online' : ''}`} style={{ marginTop: '0.5rem' }}></div>
                   <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--cs-text-muted)' }}>
                     {oppDid ? "A RÉPONDU" : "EN ATTENTE..."}
                   </span>
               </>
           )}
        </div>

        <div style={{ textAlign: 'center' }}>
            <div className="cs-label">MANCHE {qIndex + 1} / 5</div>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', lineHeight: 1, color: timeLeft < 5 ? 'var(--cs-t-red)' : '#fff' }}>
                {timeLeft}
            </div>
        </div>

        <div style={{ textAlign: 'right' }}>
           <div className="cs-label">MON SCORE</div>
           <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--cs-ct-blue)' }}>{myScore}</div>
        </div>
      </div>
      
      <div className="cs-timer-bar">
         <div 
           className="cs-timer-fill" 
           style={{ width: `${(timeLeft / ROUND_DURATION_SECONDS) * 100}%`, background: timeLeft < 5 ? 'var(--cs-t-red)' : 'var(--cs-accent)' }} 
         ></div>
      </div>

      <QuestionCard
        type={q.type || 'mcq'}
        question={q.question}
        choices={q.choices}
        disabled={selectedIndex !== undefined}
        selectedIndex={selectedIndex}
        onSelect={(ans) => onAnswer(q.id, ans)}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <div>
            {selectedIndex !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span 
                      style={{ 
                          color: correct === undefined ? 'var(--cs-text-muted)' : correct ? 'var(--cs-success)' : 'var(--cs-t-red)',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                      }}
                    >
                    {correct === undefined ? "Validation en cours..." : correct ? "VICTOIRE DE MANCHE (Correct)" : "ÉCHEC DE MANCHE (Incorrect)"}
                    </span>
                </div>
            )}
          </div>
          
          <button className="cs-btn cs-btn-t" onClick={onLeave} style={{ padding: '0.8rem 1.5rem', fontSize: '0.9rem' }}>
            ABANDONNER
          </button>
      </div>
    </div>
  );
}

