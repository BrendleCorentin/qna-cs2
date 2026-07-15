// src/components/Lobby.jsx
import React, { useState, useEffect } from 'react';

// Plus de vidéo, on revient à un design épuré mais stylé
export default function Lobby({ socket, user, setUser, setNickname, onLogout, onPlay, onLeaderboard, onAdmin, onTournament }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [topPlayers, setTopPlayers] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  const [username, setLocalUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorLocal, setErrorLocal] = useState("");
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendName, setFriendName] = useState("");
  const [socialMessage, setSocialMessage] = useState("");
  const [modal, setModal] = useState(null);
  const [profileUsername, setProfileUsername] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [settings, setSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem("counterQuizSettings")) || { reducedMotion: false, compactLobby: false }; }
    catch { return { reducedMotion: false, compactLobby: false }; }
  });

  // Fetch leaderboard when logged in
  useEffect(() => {
    if (user && socket) {
        socket.emit("getLeaderboard", (data) => {
            setTopPlayers(data || []);
            setLoadingLeaderboard(false);
        });
    }
  }, [user, socket]);

  useEffect(() => {
    if (!user || !socket) return;
    const refreshFriends = () => socket.emit("getFriends", (response) => {
      if (response?.success) setFriends(response.friends || []);
    });
    refreshFriends();
    socket.on("friendsUpdated", refreshFriends);
    const interval = setInterval(refreshFriends, 15000);
    return () => {
      clearInterval(interval);
      socket.off("friendsUpdated", refreshFriends);
    };
  }, [user, socket]);

  useEffect(() => {
    localStorage.setItem("counterQuizSettings", JSON.stringify(settings));
    document.body.classList.toggle("cs-reduced-motion", settings.reducedMotion);
    document.body.classList.toggle("cs-compact-lobby", settings.compactLobby);
  }, [settings]);

  const openProfile = () => {
    setProfileUsername(user.username);
    setProfileAvatar(user.avatarSeed || user.username);
    setSocialMessage("");
    setModal("profile");
  };

  const saveProfile = () => {
    socket.emit("updateProfile", { username: profileUsername, avatarSeed: profileAvatar }, (response) => {
      if (!response?.success) return setSocialMessage(response?.error || "Modification impossible");
      setUser(response.user);
      setNickname(response.user.username);
      setSocialMessage("Profil mis à jour");
      setTimeout(() => setModal(null), 600);
    });
  };

  const refreshFriends = () => socket.emit("getFriends", (response) => response?.success && setFriends(response.friends || []));
  const friendAction = (event, payload) => socket.emit(event, payload, (response) => {
    setSocialMessage(response?.success ? "Action effectuée" : response?.error || "Erreur");
    if (response?.success) { setFriendName(""); refreshFriends(); }
  });

  // --- NOUVEAU DESIGN DU LOBBY CONNECTÉ ---
  if (user) {
    // Génération d'un avatar basé sur le pseudo (seed)
    const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.avatarSeed || user.username)}&backgroundColor=b6e3f4`;

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
                    <button 
                        className="cs-btn-disconnect" 
                        onClick={onLogout}
                        title="Déconnexion"
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(255, 100, 100, 0.5)',
                            color: '#ff6464',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginLeft: '10px',
                            padding: '2px 8px',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                          <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                        </svg>
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
                         <button className="cs-btn-text" onClick={openProfile}>Modifier le profil</button>
                         <button className="cs-btn-text" onClick={() => { setSocialMessage(""); setModal("settings"); }}>Paramètres</button>
                    </div>
                </div>

                {/* Section Droite: Actions de Jeu */}
                <div className="cs-panel cs-play-panel">
                    <h3 className="cs-panel-title">JOUER</h3>
                    
                    <div className="cs-gamemodes">
                        <button className="cs-gamemode-card primary" onClick={onTournament}>
                            <div className="mode-icon">🏆</div>
                            <div className="mode-info">
                                <span className="mode-title">TOURNOI 1v1</span>
                                <span className="mode-desc">Créez ou rejoignez un bracket par code. Aucun impact ELO.</span>
                            </div>
                        </button>
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

                    <div className="cs-social-area" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                        <h3 className="cs-panel-title">CLASSEMENT TOP JOUEURS</h3>
                        <div className="cs-leaderboard-widget">
                             {loadingLeaderboard ? (
                                 <div style={{ textAlign: 'center', color: 'var(--cs-text-muted)', padding: '20px' }}>Chargement...</div>
                             ) : (
                                 <table className="cs-table-compact">
                                     <thead>
                                         <tr>
                                             <th>#</th>
                                             <th>JOUEUR</th>
                                             <th style={{ textAlign: 'right' }}>ELO</th>
                                         </tr>
                                     </thead>
                                     <tbody>
                                         {topPlayers.slice(0, 50).map((p, i) => (
                                             <tr key={i} className={p.username === user.username ? 'highlight' : ''}>
                                                 <td className="rank">{i + 1}</td>
                                                 <td className="name">
                                                     <img 
                                                       src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${p.username}&backgroundColor=b6e3f4`} 
                                                       className="cs-avatar-mini" 
                                                       alt="" 
                                                     />
                                                     {p.username}
                                                 </td>
                                                 <td className="elo">{p.elo}</td>
                                             </tr>
                                         ))}
                                         {topPlayers.length === 0 && (
                                             <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>Aucun classement</td></tr>
                                         )}
                                     </tbody>
                                 </table>
                             )}
                        </div>
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

                <div className="cs-panel cs-friends-panel">
                    <h3 className="cs-panel-title">AMIS <span className="cs-tag">{friends.filter(f => f.status === 'accepted').length}/20</span></h3>
                    <div className="cs-friend-add">
                        <input className="cs-input" value={friendName} onChange={(e) => setFriendName(e.target.value)} placeholder="Pseudo du joueur" />
                        <button className="cs-btn-small" disabled={!friendName.trim()} onClick={() => friendAction("sendFriendRequest", { username: friendName })}>+ AJOUTER</button>
                    </div>
                    {socialMessage && <p className="cs-social-message">{socialMessage}</p>}
                    <div className="cs-friends-list">
                      {friends.length === 0 && <p className="cs-empty-text">Aucun ami pour le moment.</p>}
                      {friends.map((friend) => (
                        <div className="cs-friend-row" key={friend.id}>
                          <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(friend.avatarSeed || friend.username)}&backgroundColor=b6e3f4`} alt="" />
                          <div><strong>{friend.username}</strong><small>{friend.status === 'accepted' ? (friend.online ? 'En ligne' : 'Hors ligne') : friend.requestedBy === friend.id ? 'Demande reçue' : 'Demande envoyée'}</small></div>
                          {friend.status === 'pending' && friend.requestedBy === friend.id
                            ? <button className="cs-btn-small" onClick={() => friendAction("acceptFriendRequest", { userId: friend.id })}>ACCEPTER</button>
                            : <button className="cs-friend-remove" onClick={() => friendAction("removeFriend", { userId: friend.id })} title="Supprimer">×</button>}
                        </div>
                      ))}
                    </div>
                </div>
            </main>
            {modal && (
              <div className="cs-modal-backdrop" onMouseDown={() => setModal(null)}>
                <div className="cs-modal" onMouseDown={(event) => event.stopPropagation()}>
                  <button className="cs-modal-close" onClick={() => setModal(null)}>×</button>
                  {modal === "profile" ? <>
                    <h2>MODIFIER LE PROFIL</h2>
                    <img className="cs-profile-preview" src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(profileAvatar || profileUsername)}&backgroundColor=b6e3f4`} alt="Aperçu" />
                    <label className="cs-label">PSEUDO</label>
                    <input className="cs-input" value={profileUsername} onChange={(e) => setProfileUsername(e.target.value)} maxLength={20} />
                    <label className="cs-label">STYLE D'AVATAR</label>
                    <input className="cs-input" value={profileAvatar} onChange={(e) => setProfileAvatar(e.target.value)} maxLength={40} placeholder="Ex: sniper, dragon..." />
                    {socialMessage && <p className="cs-social-message">{socialMessage}</p>}
                    <button className="cs-btn cs-btn-primary" onClick={saveProfile}>ENREGISTRER</button>
                  </> : <>
                    <h2>PARAMÈTRES</h2>
                    <label className="cs-setting-row"><span><strong>Réduire les animations</strong><small>Interface plus calme et plus légère.</small></span><input type="checkbox" checked={settings.reducedMotion} onChange={(e) => setSettings({ ...settings, reducedMotion: e.target.checked })} /></label>
                    <label className="cs-setting-row"><span><strong>Lobby compact</strong><small>Réduit les espacements de l'interface.</small></span><input type="checkbox" checked={settings.compactLobby} onChange={(e) => setSettings({ ...settings, compactLobby: e.target.checked })} /></label>
                  </>}
                </div>
              </div>
            )}
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
                  localStorage.setItem("counterQuizSession", res.token);
                  setUser(res.user);
                  setNickname(res.user.username);
              }
          } else {
              setErrorLocal(res?.error || "Erreur inconnue");
          }
      });
  };

  return (
    <div className="cs-auth-page">
      <div className="cs-auth-card">
        <aside className="cs-auth-intro">
            <div className="cs-auth-brand">COUNTER <span>QUIZ</span></div>
            <p className="cs-auth-kicker">LE DUEL DE CULTURE COUNTER-STRIKE</p>
            <h1>Teste tes connaissances.<br />Grimpe au classement.</h1>
            <p className="cs-auth-copy">Affronte d'autres joueurs sur les Majors, les line-ups, les transferts et l'histoire de Counter-Strike.</p>
            <div className="cs-auth-features">
                <div><strong>1V1</strong><span>Matchs classés</span></div>
                <div><strong>LIVE</strong><span>Tournois & brackets</span></div>
                <div><strong>ELO</strong><span>Classement mondial</span></div>
            </div>
        </aside>

        <section className="cs-auth-form-panel">
        <div className="cs-auth-form-header">
            <span className="cs-auth-eyebrow">ESPACE JOUEUR</span>
            <h2>{isRegistering ? "Créer un compte" : "Bon retour parmi nous"}</h2>
            <p>{isRegistering ? "Inscris-toi pour commencer à jouer." : "Connecte-toi pour accéder à tous les modes."}</p>
        </div>
        
        <div className="cs-auth-tabs">
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
        
        <form onSubmit={handleSubmit} className="cs-auth-form">
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

        <div className="cs-hint cs-auth-status">
            <span className="cs-status-dot online"></span>
            <span>SERVEURS EN LIGNE</span>
        </div>
        </section>
      </div>
    </div>
  );
}
