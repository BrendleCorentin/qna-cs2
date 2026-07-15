import { useState, useEffect } from "react";

export default function Admin({ serverUrl, onBack }) {
  const [activeTab, setActiveTab] = useState("questions"); // questions | users | matches
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- QUESTIONS STATE ---
  const [questions, setQuestions] = useState([]);
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [questionSort, setQuestionSort] = useState("newest");

  // --- USERS STATE ---
  const [users, setUsers] = useState([]);
  const [editingElo, setEditingElo] = useState(null); // { id, elo }

  // --- MATCHES STATE ---
  const [matches, setMatches] = useState([]);

  const categoryLabels = {
    qcm: "QCM",
    who_am_i: "QUI SUIS-JE ?",
    progressive: "INDICES PROGRESSIFS",
    open: "RÉPONSE LIBRE",
    lineup_completion: "COMPLÈTE LA LINE-UP",
    transfer_history: "TRANSFERTS & ANCIENNES ÉQUIPES",
    match_history: "RETROUVE LE MATCH / LE SCORE",
    date_challenge: "À QUELLE DATE ?",
    tournament_path: "PARCOURS DE TOURNOI",
  };

  const questionGroups = questions.reduce((groups, question) => {
    const category = question.category || (question.question?.toUpperCase().startsWith("QUI SUIS-JE") ? "who_am_i" : question.type === "mcq" ? "qcm" : question.type === "progressive_clue" ? "progressive" : "open");
    if (!groups[category]) groups[category] = [];
    groups[category].push(question);
    return groups;
  }, {});

  const orderedCategories = ["lineup_completion", "transfer_history", "match_history", "date_challenge", "tournament_path", "qcm", "who_am_i", "progressive", "open", ...Object.keys(questionGroups).filter((category) => !categoryLabels[category])];

  const sortQuestions = (items) => [...items].sort((a, b) => {
    if (questionSort === "oldest") return Number(a.id) - Number(b.id);
    if (questionSort === "alphabetical") return (a.question || "").localeCompare(b.question || "", "fr", { sensitivity: "base" });
    return Number(b.id) - Number(a.id);
  });

  const toggleCategory = (category) => {
    setCollapsedCategories((current) => ({ ...current, [category]: !current[category] }));
  };

  const setAllCategoriesCollapsed = (collapsed) => {
    setCollapsedCategories(Object.fromEntries(orderedCategories.map((category) => [category, collapsed])));
  };

  useEffect(() => {
    if (activeTab === "questions") fetchQuestions();
    if (activeTab === "users") fetchUsers();
    if (activeTab === "matches") fetchMatches();
  }, [activeTab]);

  // --- API CALLS ---
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${serverUrl}/admin/questions`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Impossible de charger les questions");
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
        const res = await fetch(`${serverUrl}/admin/users`);
        const data = await res.json();
        setUsers(data);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const fetchMatches = async () => {
    setLoading(true);
    try {
        const res = await fetch(`${serverUrl}/admin/matches`);
        const data = await res.json();
        setMatches(data);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  // --- HANDLERS ---
  const handleDeleteQuestion = async (id) => {
    if (!confirm("Supprimer cette question ?")) return;
    try {
      await fetch(`${serverUrl}/admin/questions/${id}`, { method: "DELETE" });
      setQuestions(questions.filter((q) => q.id !== id));
    } catch (err) { alert(err.message); }
  };

  const handleDeleteUser = async (id) => {
      if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ? Cette action est irréversible.")) return;
      try {
          await fetch(`${serverUrl}/admin/users/${id}`, { method: "DELETE" });
          setUsers(users.filter(u => u.id !== id));
      } catch (err) { alert(err.message); }
  };

  const handleUpdateElo = async (id, newElo) => {
      try {
          const res = await fetch(`${serverUrl}/admin/users/${id}/elo`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ elo: parseInt(newElo) })
          });
          if (res.ok) {
              setUsers(users.map(u => u.id === id ? { ...u, elo: parseInt(newElo) } : u));
              setEditingElo(null);
          }
      } catch (err) { alert(err.message); }
  };

  return (
    <div className="cs-container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
      <div className="cs-card" style={{ maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
        
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid var(--cs-border)", paddingBottom: "1rem" }}>
          <h1 className="cs-hero-title" style={{ fontSize: "2rem", margin: 0, borderLeft: "none" }}>
            ADMINISTRA<span style={{ color: "var(--cs-accent)" }}>TION</span>
          </h1>
          <button className="cs-btn" onClick={onBack}>RETOUR AU JEU</button>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button 
                className={`cs-btn ${activeTab === 'questions' ? 'cs-btn-primary' : ''}`}
                onClick={() => setActiveTab('questions')}
            >
                QUESTIONS
            </button>
            <button 
                className={`cs-btn ${activeTab === 'users' ? 'cs-btn-primary' : ''}`}
                onClick={() => setActiveTab('users')}
            >
                UTILISATEURS
            </button>
            <button 
                className={`cs-btn ${activeTab === 'matches' ? 'cs-btn-primary' : ''}`}
                onClick={() => setActiveTab('matches')}
            >
                HISTORIQUE MATCHS
            </button>
        </div>

        {/* CONTENT */}
        <div className="cs-admin-content">
            {activeTab === 'questions' && (
                <div>
                    {/* Liste Questions */}
                    <div>
                        <div style={{ borderBottom: '1px solid var(--cs-border)', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <h3 style={{ margin: 0, color: "var(--cs-text-main)" }}>LISTE DES QUESTIONS ({questions.length})</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <select className="cs-input" value={questionSort} onChange={(event) => setQuestionSort(event.target.value)} style={{ width: 'auto', padding: '8px 12px' }} aria-label="Trier les questions">
                                    <option value="newest">Plus récentes</option>
                                    <option value="oldest">Plus anciennes</option>
                                    <option value="alphabetical">Ordre alphabétique</option>
                                </select>
                                <button className="cs-btn-small" onClick={() => setAllCategoriesCollapsed(true)}>TOUT REPLIER</button>
                                <button className="cs-btn-small" onClick={() => setAllCategoriesCollapsed(false)}>TOUT DÉPLIER</button>
                            </div>
                        </div>
                    </div>
                    
                    {questions.length === 0 && <p style={{ color: "var(--cs-text-muted)" }}>Aucune question trouvée.</p>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                        {orderedCategories.map((category) => {
                            const categoryQuestions = sortQuestions(questionGroups[category] || []);
                            if (categoryQuestions.length === 0) return null;
                            const isCollapsed = Boolean(collapsedCategories[category]);
                            return (
                                <section key={category}>
                                    <button
                                        type="button"
                                        onClick={() => toggleCategory(category)}
                                        aria-expanded={!isCollapsed}
                                        style={{ width: '100%', padding: '10px 0', color: 'var(--cs-accent)', background: 'transparent', border: 0, borderBottom: '1px solid var(--cs-border)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', font: 'inherit', fontWeight: 'bold', textAlign: 'left' }}
                                    >
                                        <span><span style={{ display: 'inline-block', width: '22px' }}>{isCollapsed ? '▶' : '▼'}</span>{categoryLabels[category] || category.toUpperCase()}</span>
                                        <span className="cs-tag">{categoryQuestions.length}</span>
                                    </button>
                                    {!isCollapsed && <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                                        {categoryQuestions.map(q => (
                                            <div key={q.id} style={{ background: '#1e1e24', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', borderRadius: '4px' }}>
                                                <span style={{ whiteSpace: 'pre-line' }}><b>{q.question}</b> <small style={{ color: "var(--cs-text-muted)" }}>({q.type})</small></span>
                                                <button className="cs-btn cs-btn-t text-red" onClick={() => handleDeleteQuestion(q.id)}>SUPPRIMER</button>
                                            </div>
                                        ))}
                                    </div>}
                                </section>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <table className="cs-table-compact" style={{ width: '100%', textAlign: 'left' }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>PSEUDO</th>
                            <th>ELO</th>
                            <th>DATE CRÉATION</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>{u.id}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${u.username}&backgroundColor=b6e3f4`} className="cs-avatar-mini" alt="" />
                                        {u.username}
                                    </div>
                                </td>
                                <td>
                                    {editingElo?.id === u.id ? (
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <input 
                                                type="number" 
                                                className="cs-input" 
                                                style={{ width: '80px', padding: '5px' }}
                                                value={editingElo.elo} 
                                                onChange={(e) => setEditingElo({ ...editingElo, elo: e.target.value })}
                                            />
                                            <button className="cs-btn-small" onClick={() => handleUpdateElo(u.id, editingElo.elo)}>OK</button>
                                            <button className="cs-btn-small" onClick={() => setEditingElo(null)} style={{ background: '#444' }}>X</button>
                                        </div>
                                    ) : (
                                        <span onClick={() => setEditingElo({ id: u.id, elo: u.elo })} style={{ cursor: 'pointer', borderBottom: '1px dashed #666' }} title="Cliquez pour modifier">
                                            {u.elo}
                                        </span>
                                    )}
                                </td>
                                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                <td>
                                    <button className="cs-btn cs-btn-t text-red" onClick={() => handleDeleteUser(u.id)} style={{ padding: '5px 10px', fontSize: '0.8rem' }}>
                                        SUPPRIMER
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {activeTab === 'matches' && (
                <div style={{ overflowX: 'auto' }}>
                    <table className="cs-table-compact" style={{ width: '100%', textAlign: 'left' }}>
                        <thead>
                            <tr>
                                <th>DATE</th>
                                <th>JOUEUR 1</th>
                                <th>SCORE</th>
                                <th>JOUEUR 2</th>
                                <th>VAINQUEUR</th>
                                <th>RAISON</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matches.map(m => (
                                <tr key={m.id}>
                                    <td>{new Date(m.timestamp).toLocaleString()}</td>
                                    <td>{m.player1}</td>
                                    <td><span style={{ color: 'var(--cs-ct-blue)' }}>{m.score1}</span> - <span style={{ color: 'var(--cs-t-red)' }}>{m.score2}</span></td>
                                    <td>{m.player2}</td>
                                    <td style={{ color: 'var(--cs-accent)', fontWeight: 'bold' }}>{m.winner}</td>
                                    <td style={{ fontSize: '0.8rem', color: '#888' }}>{m.reason}</td>
                                </tr>
                            ))}
                            {matches.length === 0 && <tr><td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>Aucun match enregistré</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}
