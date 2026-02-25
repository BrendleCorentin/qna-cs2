import React from 'react';

export default function Queue({ status }) {
  return (
    <div className="cs-container" style={{ textAlign: 'center' }}>
      <div className="cs-card" style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
        <h2 className="cs-hero-title" style={{ fontSize: '2rem', borderLeft: 'none', marginBottom: '1rem' }}>
          MATCHMAKING
        </h2>
        
        <div style={{ margin: '2rem 0' }}>
            <div className="cs-status-dot searching" style={{ width: '20px', height: '20px' }}></div>
        </div>

        <p className="cs-label" style={{ fontSize: '1rem', color: '#fff' }}>
          {status === "waiting" ? "RECHERCHE DE JOUEURS..." : "CONNEXION AU SERVEUR..."}
        </p>
        
        <div className="cs-hint" style={{ justifyContent: 'center', marginTop: '1rem' }}>
          Temps estimé : 00:05
        </div>
      </div>
    </div>
  );
}
