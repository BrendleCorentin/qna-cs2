// src/components/Lobby.jsx
import React, { useState } from 'react';

// Video Background Component
const VideoBackground = () => {
    // ID d'une vidéo showcase CS2 de haute qualité (Ex: Maps montage)
    // On utilise une playlist pour boucler proprement
    const videoId = "u3tC8CdB9kE"; // CS2 Trailer / Showcase Cinematic
    
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            overflow: 'hidden',
        }}>
            {/* Overlay sombre pour la lisibilité */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(18, 20, 21, 0.75)', // Assombri pour le texte
                zIndex: 1
            }}></div>
            
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '120vw', 
                height: '120vh',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none' // Empêche l'interaction avec la vidéo
            }}>
                <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}&disablekb=1&modestbranding=1`}
                    title="CS2 Background" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    style={{ objectFit: 'cover', opacity: 0.6 }}
                ></iframe>
            </div>
        </div>
    );
};

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
          <VideoBackground />
          <div className="cs-card" style={{ maxWidth: '600px', margin: '0 auto', width: '100%', position: 'relative', background: 'rgba(28, 30, 36, 0.85)', backdropFilter: 'blur(10px)' }}>
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

            {/* Admin Button - Only visible if username is admin */}
            {user.username.toLowerCase() === "admin" && (
                <button
                    className="cs-btn"
                    onClick={onAdmin}
                    style={{ width: '100%', fontSize: '0.8rem', padding: '0.8rem', opacity: 0.5, background: 'none', border: 'none' }}
                >
                    ADMIN PANEL
                </button>
            )}
          </div>
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
      <VideoBackground />
      <div className="cs-card" style={{ maxWidth: '500px', margin: '0 auto', width: '100%', position: 'relative', background: 'rgba(28, 30, 36, 0.85)', backdropFilter: 'blur(10px)' }}>
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
