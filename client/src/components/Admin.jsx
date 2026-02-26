import { useState, useEffect } from "react";

export default function Admin({ serverUrl, onBack }) {
  const [activeTab, setActiveTab] = useState("questions"); // questions | users | matches
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- QUESTIONS STATE ---
  const [questions, setQuestions] = useState([]);
  const [type, setType] = useState("mcq");
  const [questionText, setQuestionText] = useState("");
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [answerIndex, setAnswerIndex] = useState(0);
  const [textAnswer, setTextAnswer] = useState("");

  // --- USERS STATE ---
  const [users, setUsers] = useState([]);
  const [editingElo, setEditingElo] = useState(null); // { id, elo }

  // --- MATCHES STATE ---
  const [matches, setMatches] = useState([]);

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
      setQuestions(data);
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

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    const payload = { type, question: questionText };
    if (type === "mcq") {
      payload.choices = choices;
      payload.answerIndex = parseInt(answerIndex);
    } else {
      payload.answer = textAnswer;
    }

    try {
      const res = await fetch(`${serverUrl}/admin/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const newQ = await res.json();
        setQuestions([newQ, ...questions]);
        setQuestionText("");
        setChoices(["", "", "", ""]);
        alert("Question ajoutée !");
      }
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
                    {/* Formulaire existant simplifié pour la lisibilité */}
                    <div style={{ background: "rgba(0,0,0,0.3)", padding: "1.5rem", borderRadius: "4px", marginBottom: "2rem", border: "1px solid var(--cs-border)" }}>
                        <h3 style={{ marginTop: 0, color: "var(--cs-accent)" }}>AJOUTER UNE QUESTION</h3>
                        <form onSubmit={handleSubmitQuestion}>
                            <div className="cs-input-group">
                                <label className="cs-label">ÉNONCÉ</label>
                                <input className="cs-input" value={questionText} onChange={(e) => setQuestionText(e.target.value)} required />
                            </div>
                            {/* ... (Supposons que le formulaire reste similaire, pour simplifier l'exemple ici, je garde l'essentiel) */}
                             <div className="cs-input-group">
                                <label className="cs-label">TYPE</label>
                                <select className="cs-input" value={type} onChange={(e) => setType(e.target.value)}>
                                    <option value="mcq">QCM</option>
                                    <option value="text">Texte</option>
                                </select>
                            </div>
                            {type === 'mcq' && choices.map((c, i) => (
                                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                                    <input type="radio" checked={answerIndex === i} onChange={() => setAnswerIndex(i)} />
                                    <input className="cs-input" value={c} onChange={(e) => {
                                        const n = [...choices]; n[i] = e.target.value; setChoices(n);
                                    }} placeholder={`Choix ${i+1}`} />
                                </div>
                            ))}
                             {type === 'text' && (
                                <input className="cs-input" value={textAnswer} onChange={(e) => setTextAnswer(e.target.value)} placeholder="Réponse" />
                            )}
                            <button type="submit" className="cs-btn cs-btn-primary" style={{ marginTop: '10px' }}>AJOUTER</button>
                        </form>
                    </div>

                    {/* Liste Questions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {questions.map(q => (
                            <div key={q.id} style={{ background: '#1e1e24', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span><b>{q.question}</b> <small>({q.type})</small></span>
                                <button className="cs-btn cs-btn-t text-red" onClick={() => handleDeleteQuestion(q.id)}>SUPPRIMER</button>
                            </div>
                        ))}
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
