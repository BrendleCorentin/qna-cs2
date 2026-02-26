// src/components/Lobby.jsx
import React, { useState } from 'react';

export default function Lobby({ socket, user, setUser, setNickname, onPlay, onLeaderboard, onAdmin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setLocalUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorLocal, setErrorLocal] = useState("");
  const [loading, setLoading] = useState(false);

  // If user is logged in, show profile
  if (user) {
    return (
        <div className="cs-container">
          <div className="cs-card" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            <h1 className="cs-hero-title" style={{ fontSize: '3rem', textAlign: 'center', borderLeft: 'none' }}>
              PROFIL <span style={{ color: 'var(--cs-accent)' }}>JOUEUR</span>
            </h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', margin: '2rem 0' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderTop: '4px solid var(--cs-ct-blue)' }}>
                    <div className="cs-label">PSEUDO</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{user.username}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderTop: '4px solid var(--cs-accent)' }}>
                    <div className="cs-label">CLASSEMENT ELO</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--cs-accent)' }}>{user.elo}</div>
                </div>
            </div>
    
            <button 
                className="cs-btn"
                onClick={onLeaderboard}
                style={{ width: '100%', marginBottom: '1rem', background: 'transparent', border: '1px solid var(--cs-text-light)', opacity: 0.8 }}
            >
                TOP 50 JOUEURS
            </button>

            <button 
              className="cs-btn cs-btn-primary" 
              onClick={() => onPlay(false)}
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              LANCER LE MATCHMAKING (RANKED)
            </button>

            <button 
              className="cs-btn" 
              onClick={() => onPlay(true)} // true = solo mode
              style={{ width: '100%', marginBottom: '1rem', background: 'var(--cs-accent)', border: 'none' }}
            >
              MODE SOLO (ENTRAÎNEMENT)
            </button>
            
            <button
                className="cs-btn"
                onClick={() => { setUser(null); setNickname(""); }}
                style={{ width: '100%', fontSize: '0.8rem', padding: '0.8rem', opacity: 0.7, marginBottom: '1rem' }}
            >
                DÉCONNEXION
            </button>

            <button
                className="cs-btn"
                onClick={onAdmin}
                style={{ width: '100%', fontSize: '0.8rem', padding: '0.8rem', opacity: 0.5, background: 'none', border: 'none' }}
            >
                ADMIN PANEL
            </button>
          </div>
        </div>
      );
  }

  // Auth Form
  const handleSubmit = (e) => {
      e.preventDefault();
      setErrorLocal("");

      // SHORTCUT: Si l'utilisateur tente de se connecter en tant que "ADMIN", on le redirige vers le panel
      if (username.toUpperCase() === "ADMIN") {
        onAdmin();
        return;
      }
      
      if (!socket || !socket.connected) {
          console.error("Socket non connecté lors de la soumission");
          setErrorLocal("Erreur: Non connecté au serveur. Vérifiez votre connexion.");
          return;
      }

      setLoading(true);

      const event = isRegistering ? "register" : "login";
      
      // Timeout safety
      const timeoutId = setTimeout(() => {
          if (loading) {
            setLoading(false);
            setErrorLocal("Le serveur ne répond pas (timeout). Réessayez.");
          }
      }, 5000);

      socket.emit(event, { username, password }, (res) => {
          clearTimeout(timeoutId);
          setLoading(false);
          if (res?.success) {
              if (isRegistering) {
                  // Register success -> Switch to login or auto login?
                  setIsRegistering(false);
                  setErrorLocal("Compte créé ! Connectez-vous.");
              } else {
                  // Login success
                  setUser(res.user);
                  setNickname(res.user.username);
              }
          } else {
              setErrorLocal(res?.error || "Erreur inconnue");
          }
      });
  };

  return (
    <div className="cs-container">
      <div className="cs-card" style={{ maxWidth: '500px', margin: '0 auto', width: '100%' }}>
        <h1 className="cs-hero-title" style={{ fontSize: '2.5rem', textAlign: 'center', borderLeft: 'none' }}>
          COUNTER <span style={{ color: 'var(--cs-accent)' }}>QUIZ</span>
        </h1>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button 
                className={`cs-btn ${!isRegistering ? '' : 'cs-btn-disabled'}`} 
                style={{ flex: 1, opacity: !isRegistering ? 1 : 0.4, borderBottom: !isRegistering ? '2px solid var(--cs-accent)' : 'none' }}
                onClick={() => { setIsRegistering(false); setErrorLocal(""); }}
            >
                CONNEXION
            </button>
            <button 
                className={`cs-btn ${isRegistering ? '' : 'cs-btn-disabled'}`} 
                style={{ flex: 1, opacity: isRegistering ? 1 : 0.4, borderBottom: isRegistering ? '2px solid var(--cs-accent)' : 'none' }}
                onClick={() => { setIsRegistering(true); setErrorLocal(""); }}
            >
                INSCRIPTION
            </button>
        </div>
        
        <form onSubmit={handleSubmit}>
            <div className="cs-input-group">
            <label className="cs-label">IDENTIFIANT</label>
            <input
                className="cs-input"
                value={username}
                onChange={(e) => setLocalUsername(e.target.value)}
                placeholder="Pseudo..."
                required
            />
            </div>

            <div className="cs-input-group">
            <label className="cs-label">MOT DE PASSE</label>
            <input
                className="cs-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
            />
            </div>

            {errorLocal && (
                <div style={{ color: 'var(--cs-t-red)', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold' }}>
                    {errorLocal}
                </div>
            )}

            <button 
                type="submit"
                className="cs-btn cs-btn-primary" 
                disabled={loading || !username || !password}
                style={{ width: '100%' }}
            >
                {loading ? "CHARGEMENT..." : (isRegistering ? "CRÉER UN COMPTE" : "SE CONNECTER")}
            </button>
            
            {/* BOUTON SECRET ADMIN (Visible si on tape ADMIN ou juste cliquable pour test) */}
             <div style={{textAlign: 'center', marginTop: '10px'}}>
                <span 
                    onClick={onAdmin} 
                    style={{ 
                        fontSize: '0.75rem', 
                        color: '#666', 
                        cursor: 'pointer', 
                        textDecoration: 'underline' 
                    }}
                >
                    Connexion Admin (Cliquer ici si le raccourci ne marche pas)
                </span>
             </div>

        </form>

        <div style={{ margin: '2rem 0', textAlign: 'center', borderTop: '1px solid var(--cs-border)', paddingTop: '1rem' }}>
            <div className="cs-label" style={{marginBottom: '1rem'}}>OU JOUER EN INVITÉ</div>
            <button 
                className="cs-btn" 
                onClick={() => { setNickname("Invité"); onPlay(); }}
                style={{ width: '100%', fontSize: '0.9rem', padding: '0.8rem', marginBottom: '1rem' }}
            >
                PARTIE RAPIDE (NON CLASSÉ)
            </button>
            <button 
                className="cs-btn" 
                onClick={() => { setNickname("TrainingBot"); onPlay(true); }}
                style={{ width: '100%', fontSize: '0.9rem', padding: '0.8rem', background: 'var(--cs-accent)', border: 'none' }}
            >
                MODE SOLO (ENTRAÎNEMENT)
            </button>
        </div>
            
        <div className="cs-hint" style={{ marginTop: '1rem', justifyContent: 'center' }}>
            <span className="cs-status-dot online"></span>
            <span>SERVEURS EN LIGNE</span>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '1rem', opacity: 0.5, fontSize: '0.8rem', color: 'var(--cs-text-muted)' }}>
        VERSION 2.4 • RANKED FIX • <span onClick={onAdmin} style={{ cursor: "pointer", textDecoration: "underline" }}>ADMIN</span>
      </div>
    </div>
  );
}
