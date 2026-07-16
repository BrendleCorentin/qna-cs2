import React from 'react';

export default function Result({ endInfo, onReplay }) {
  const r = endInfo?.result;
  const isSolo = endInfo?.isSolo;
  const isStreak = endInfo?.isStreak;
  const reasonLabels = {
      wrong_answer: "Mauvaise réponse",
      timeout: "Temps écoulé",
      question_bank_completed: "Toutes les questions ont été réussies",
      left: "Partie abandonnée",
      no_questions: "Aucune question disponible",
  };
  
  let title = "ÉGALITÉ";
  let color = "var(--cs-ct-blue)";
  
  if (isStreak) {
      title = endInfo?.newRecord ? "NOUVEAU RECORD !" : "SÉRIE TERMINÉE";
      color = endInfo?.newRecord ? "#ff8a28" : "var(--cs-accent)";
  } else if (isSolo) {
      title = "FIN DE SÉRIE";
      color = "var(--cs-accent)";
  } else if (r === "win") {
      title = "VICTOIRE";
      color = "var(--cs-accent)";
  } else if (r === "loss" || r === "lose") { // handle both just in case
      title = "DÉFAITE";
      color = "var(--cs-t-red)";
  }

  return (
    <div className="cs-container" style={{ textAlign: 'center' }}>
      <div className="cs-card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '3rem' }}>
        <h1 className="cs-hero-title" style={{ color: color, fontSize: '4rem', marginBottom: '1rem', border: 'none', textAlign: 'center' }}>
          {title}
        </h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', margin: '2rem 0' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem' }}>
                <div className="cs-label">{isStreak ? "VOTRE SÉRIE" : "VOTRE SCORE"}</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{endInfo?.yourScore ?? "-"}</div>
                
                {isStreak ? (
                     <div style={{ marginTop: '0.5rem', fontSize: '1rem', color: '#ff8a28' }}>
                        🔥 RECORD PERSONNEL : {endInfo?.bestStreak ?? endInfo?.streak ?? 0}
                    </div>
                ) : isSolo ? (
                     <div style={{ marginTop: '0.5rem', fontSize: '1rem', color: 'var(--cs-text-muted)' }}>
                        ENTRAÎNEMENT
                    </div>
                ) : endInfo?.eloChange !== undefined && endInfo.eloChange !== 0 ? (
                    <div style={{ marginTop: '0.5rem', fontSize: '1.2rem', color: endInfo.eloChange > 0 ? 'var(--cs-success)' : 'var(--cs-t-red)' }}>
                        RANK: {endInfo.elo} ({endInfo.eloChange > 0 ? '+' : ''}{endInfo.eloChange})
                    </div>
                ) : null}
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem' }}>
                <div className="cs-label">{isStreak ? "RÈGLE" : "ADVERSAIRE"}</div>
                <div style={{ fontSize: isStreak ? '1.1rem' : '2.5rem', fontWeight: 'bold', color: 'var(--cs-text-muted)', paddingTop: isStreak ? '.8rem' : 0 }}>
                    {isStreak ? "Une erreur ou un timeout termine la partie." : endInfo?.oppScore ?? "-"}
                </div>
            </div>
        </div>

        {endInfo?.reason ? <p className="cs-label" style={{ color: 'var(--cs-text-muted)', marginBottom: '2rem' }}>{reasonLabels[endInfo.reason] || endInfo.reason.toUpperCase()}</p> : null}
        
        <button className="cs-btn cs-btn-primary" onClick={onReplay} style={{ width: '100%' }}>
          {isStreak ? "RETOUR AU LOBBY" : "NOUVEAU MATCH"}
        </button>
      </div>
    </div>
  );
}
