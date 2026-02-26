import React, { useEffect, useState } from "react";
import QuestionCard from "./QuestionCard.jsx";

export default function Match({
  opponentName,
  questions,
  qIndex,
  deadline,
  currentDuration, // NEW
  answered,
  opponentAnswered,
  myScore,
  onAnswer,
  onLeave,
  // New props for emotes
  activeEmote,
  onSendEmote,
  myId,
  opponentId
}) {
  const maxDuration = currentDuration ? currentDuration / 1000 : 10;
  // Timer logic
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!deadline) {
        setTimeLeft(0);
        return;
    }
    const update = () => {
        const diff = deadline - Date.now();
        const sec = Math.max(0, Math.ceil(diff / 1000));
        setTimeLeft(sec);
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

  // Emote logic
  // Is the active emote from opponent?
  const isOpponentEmote = activeEmote && activeEmote.senderId !== myId;
  // Is the active emote from me?
  const isMyEmote = activeEmote && activeEmote.senderId === myId;

  const EMOTES = ["Nice Shot!", "EZ", "Lag?", "GL HF", "GG"];

  return (
    <div className="cs-container cs-match-container">
      {/* Header with Opponent Info & Emote Bubble */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', position: 'relative' }}>
        
        {/* Opponent Area */}
        <div style={{ position: 'relative' }}>
           <div className="cs-label">ADVERSAIRE</div>
           <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{opponentName}</div>
           
           {/* Opponent Emote Bubble */}
           {isOpponentEmote && (
               <div className="cs-emote-bubble opponent">
                   {activeEmote.message}
               </div>
           )}

           <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
               <div className={`cs-status-dot ${oppDid ? 'online' : ''}`}></div>
               <span style={{ fontSize: '0.8rem', color: 'var(--cs-text-muted)' }}>
                 {oppDid ? "A RÉPONDU" : "EN ATTENTE..."}
               </span>
           </div>
        </div>

        {/* Timer Center */}
        <div style={{ textAlign: 'center' }}>
            <div className="cs-label">MANCHE {qIndex + 1} / {questions.length}</div>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', lineHeight: 1, color: timeLeft < 3 ? 'var(--cs-t-red)' : '#fff' }}>
                {timeLeft}
            </div>
        </div>

        {/* My Score Area */}
        <div style={{ textAlign: 'right', position: 'relative' }}>
           <div className="cs-label">MON SCORE</div>
           <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--cs-ct-blue)' }}>{myScore}</div>
           
           {/* My Emote Bubble */}
           {isMyEmote && (
               <div className="cs-emote-bubble me">
                   {activeEmote.message}
               </div>
           )}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="cs-timer-bar">
         <div 
           className="cs-timer-fill" 
           style={{ width: `${(timeLeft / maxDuration) * 100}%`, background: timeLeft < 3 ? 'var(--cs-t-red)' : 'var(--cs-accent)' }} 
         ></div>
      </div>

      {/* Question */}
      <QuestionCard
        type={q.type || 'mcq'}
        question={q.question}
        choices={q.choices}
        clues={q.clues}
        timeLeft={timeLeft}
        disabled={selectedIndex !== undefined || timeLeft <= 0}
        selectedIndex={selectedIndex}
        onSelect={(ans) => onAnswer(q.id, ans)}
      />

      {/* Footer: Status & Actions */}
      <div style={{ marginTop: '1rem' }}>
          {/* Status Message */}
          <div style={{ minHeight: '30px', marginBottom: '1rem' }}>
            {selectedIndex !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span 
                      style={{ 
                          color: correct === undefined ? 'var(--cs-text-muted)' : correct ? 'var(--cs-success)' : 'var(--cs-t-red)',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                      }}
                    >
                    {correct === undefined ? "Validation en cours..." : correct ? "VICTOIRE DE MANCHE" : "ÉCHEC DE MANCHE"}
                    </span>
                </div>
            )}
          </div>
          
          {/* Quick Chat & Leave */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              
              {/* Emote Buttons */}
              <div className="cs-emote-bar">
                  {EMOTES.map(txt => (
                      <button 
                        key={txt} 
                        className="cs-btn-emote"
                        onClick={() => onSendEmote(txt)}
                        title="Envoyer message rapide"
                      >
                          {txt}
                      </button>
                  ))}
              </div>

              <button className="cs-btn cs-btn-t" onClick={onLeave} style={{ padding: '0.8rem 1.5rem', fontSize: '0.8rem', opacity: 0.8 }}>
                ABANDONNER
              </button>
          </div>
      </div>
      
      {/* Inline Styles for Bubbles (to avoid new CSS file for now) */}
      <style>{`
        .cs-emote-bubble {
            position: absolute;
            background: white;
            color: black;
            padding: 8px 12px;
            border-radius: 12px;
            font-weight: bold;
            font-size: 0.9rem;
            animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            z-index: 10;
            white-space: nowrap;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        }
        .cs-emote-bubble.opponent {
            top: 40px;
            left: 100%;
            margin-left: 10px;
            border-bottom-left-radius: 0;
        }
        .cs-emote-bubble.me {
            top: 40px;
            right: 100%;
            margin-right: 10px;
            border-bottom-right-radius: 0;
        }
        .cs-btn-emote {
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            color: var(--cs-text-light);
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.8rem;
            transition: all 0.2s;
            font-weight: bold;
        }
        .cs-btn-emote:hover {
            background: var(--cs-accent);
            color: black;
            transform: translateY(-2px);
        }
        .cs-emote-bar {
            display: flex;
            gap: 5px;
        }
        @keyframes popIn {
            from { transform: scale(0); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}


