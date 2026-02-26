// src/components/Lobby.jsx
import React, { useState } from 'react';

// Plus de vidéo, on revient à un design épuré mais stylé
export default function Lobby({ socket, user, setUser, setNickname, onPlay, onLeaderboard, onAdmin }) {
  const [isRegistering, setIsRegistering] = useState(false);

  const [username, setLocalUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorLocal, setErrorLocal] = useState("");
  const [loading, setLoading] = useState(false);

  // --- NOUVEAU DESIGN DU LOBBY CONNECTÉ ---
  if (user) {
    // Génération d'un avatar basé sur le pseudo (seed)
    const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}&backgroundColor=b6e3f4`;

    return (
        <div className="cs-lobby-container">
            {/* Header / Top Bar */}
            <header className="cs-lobby-header">
                <div className="cs-brand">
                    COUNTER <span className="text-accent">QUIZ</span>
                </div>
                <div className="cs-user-pill">
                    <img src={avatarUrl} alt="Avatar" className="cs-avatar-sm" />
                    <span>{user.username}</span>
                    <span className="cs-elo-badge">{user.elo} ELO</span>
                    <button className="cs-btn-icon" onClick={() => { setUser(null); setNickname(""); }} title="Déconnexion">
                        ✕
                    </button>
                </div>
            </header>

            <main className="cs-lobby-content">
                {/* Section Gauche: Profil & Stats */}
                <div className="cs-panel cs-profile-panel">
                    <div className="cs-profile-header">
                        <div className="cs-avatar-lg-wrapper">
                            <img src={avatarUrl} alt="Profile" className="cs-avatar-lg" />
                            <div className="cs-online-status"></div>
                        </div>
                        <h2>{user.username}</h2>
                        <div className="cs-rank-display">
                            <span className="cs-rank-label">RANG ACTUEL</span>
                            <span className="cs-rank-value">{user.elo} <small>pts</small></span>
                        </div>
                    </div>
                    
                    <div className="cs-stats-grid">
                        <div className="cs-stat-box">
                            <span className="label">Victoires</span>
                            <span className="value">-</span>
                        </div>
                        <div className="cs-stat-box">
                            <span className="label">Ratio V/D</span>
                            <span className="value">-</span>
                        </div>
                    </div>

                    <div className="cs-action-list">
                         <button className="cs-btn-text">Modifier le profil</button>
                         <button className="cs-btn-text">Paramètres</button>
                    </div>
                </div>

                {/* Section Droite: Actions de Jeu */}
                <div className="cs-panel cs-play-panel">
                    <h3 className="cs-panel-title">JOUER</h3>
                    
                    <div className="cs-gamemodes">
                        <button className="cs-gamemode-card primary" onClick={() => onPlay(false)}>
                            <div className="mode-icon">⚔️</div>
                            <div className="mode-info">
                                <span className="mode-title">CLASSÉ 1v1</span>
                                <span className="mode-desc">Affrontez un joueur de votre niveau. Gain d'ELO.</span>
                            </div>
                        </button>

                        <button className="cs-gamemode-card secondary" onClick={() => onPlay(true)}>
                            <div className="mode-icon">🎯</div>
                            <div className="mode-info">
                                <span className="mode-title">ENTRAÎNEMENT</span>
                                <span className="mode-desc">Entraînez-vous contre un bot. Pas d'enjeu.</span>
                            </div>
                        </button>
                    </div>

                    <div className="cs-social-area">
                        <h3 className="cs-panel-title">CLASSEMENT</h3>
                        <button className="cs-btn-wide" onClick={onLeaderboard}>
                            🏆 VOIR LE TOP 50 HLTV
                        </button>
                    </div>
                    
                    {/* Admin Button Discreet */}
                    {user.username.toLowerCase() === "admin" && (
                         <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--cs-border)' }}>
                            <button onClick={onAdmin} className="cs-btn-text text-red">
                                🔧 Administration
                            </button>
                         </div>
                    )}
                </div>

                {/* Section Amis (Placeholder pour futur) */}
                <div className="cs-panel cs-friends-panel">
                    <h3 className="cs-panel-title">AMIS <span className="cs-tag">0/20</span></h3>
                    <div className="cs-friends-list-empty">
                        <p>Aucun ami connecté.</p>
                        <button className="cs-btn-small">+ Ajouter</button>
                    </div>
                </div>
            </main>
        </div>
      );
  }


  // Auth Form
  const handleSubmit = (e) => {
      e.preventDefault();
      setErrorLocal("");

      // SHORTCUT ADMIN DIRECT
      // Si l'identifiant est ADMIN et le mot de passe est "admin123", on passe directement au panel
      if (username.toUpperCase() === "ADMIN") {
         if (password === "admin123") {
             onAdmin(); 
         } else {
             setErrorLocal("Mot de passe Admin incorrect");
         }
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
      {/* Background simplifie */}
      <div className="cs-card" style={{ maxWidth: '600px', margin: '0 auto', width: '100%', position: 'relative', background: 'rgba(28, 30, 36, 0.95)', border: '1px solid var(--cs-border)', padding: '40px' }}>
        <h1 className="cs-hero-title" style={{ fontSize: '2.5rem', textAlign: 'center', borderLeft: 'none' }}>
          COUNTER <span style={{ color: 'var(--cs-accent)' }}>QUIZ</span>
        </h1>
        
        <div style={{ display: 'flex', gap: '0', marginBottom: '2rem', background: 'rgba(0,0,0,0.3)', padding: '5px', borderRadius: '8px' }}>
            <button 
                className="cs-btn"
                style={{ 
                    flex: 1, 
                    background: !isRegistering ? 'var(--cs-accent)' : 'transparent',
                    color: !isRegistering ? '#000' : 'var(--cs-text-muted)',
                    opacity: 1,
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                    padding: '12px'
                }}
                onClick={() => { setIsRegistering(false); setErrorLocal(""); }}
            >
                CONNEXION
            </button>
            <button 
                className="cs-btn"
                style={{ 
                    flex: 1, 
                    background: isRegistering ? 'var(--cs-accent)' : 'transparent',
                    color: isRegistering ? '#000' : 'var(--cs-text-muted)',
                    opacity: 1,
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                    padding: '12px'
                }}
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
        VERSION 2.4 • RANKED FIX
      </div>
    </div>
  );
}
