import { useState, useEffect } from "react";

export default function Admin({ serverUrl, onBack }) {
  const [password, setPassword] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // New Question Form State
  const [type, setType] = useState("mcq"); // mcq | text
  const [questionText, setQuestionText] = useState("");
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [answerIndex, setAnswerIndex] = useState(0);
  const [textAnswer, setTextAnswer] = useState("");

  const checkPassword = () => {
    // Simple client-side check for now (as requested "juste un pannel")
    // In a real app, this should be a server endpoint w/ session
    if (password === "admin123") {
      setIsAuth(true);
      fetchQuestions();
    } else {
      setError("Mot de passe incorrect");
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${serverUrl}/admin/questions`);
      if (!res.ok) throw new Error("Erreur chargement");
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette question ?")) return;
    try {
      const res = await fetch(`${serverUrl}/admin/questions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setQuestions(questions.filter((q) => q.id !== id));
      }
    } catch (err) {
      alert("Erreur suppression: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      type,
      question: questionText,
    };

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
        // Reset form
        setQuestionText("");
        setChoices(["", "", "", ""]);
        setAnswerIndex(0);
        setTextAnswer("");
        alert("Question ajoutée !");
      } else {
        const err = await res.json();
        alert("Erreur: " + err.error);
      }
    } catch (err) {
      alert("Erreur réseau: " + err.message);
    }
  };

  if (!isAuth) {
    return (
      <div className="admin-login" style={{ padding: "2rem", color: "white" }}>
        <h2>Accès Admin</h2>
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "8px", marginRight: "8px" }}
        />
        <button onClick={checkPassword} style={{ padding: "8px" }}>
          Entrer
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button
          onClick={onBack}
          style={{ marginTop: "1rem", display: "block", background: "none", color: "#aaa", border: "none", cursor: "pointer" }}
        >
          &larr; Retour
        </button>
      </div>
    );
  }

  return (
    <div className="admin-panel" style={{ padding: "2rem", color: "white", maxWidth: "800px", margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>Administration des Questions</h1>
        <button onClick={onBack} style={{ padding: "5px 10px" }}>Retour au jeu</button>
      </header>

      <div className="add-question-section" style={{ background: "#222", padding: "1rem", borderRadius: "8px", marginBottom: "2rem" }}>
        <h3>Ajouter une question</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label>Type: </label>
            <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: "5px" }}>
              <option value="mcq">QCM (4 choix)</option>
              <option value="text">Texte Libre (Qui suis-je ?)</option>
            </select>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Question:</label>
            <textarea
              required
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              style={{ width: "100%", height: "80px", padding: "8px" }}
            />
          </div>

          {type === "mcq" && (
            <div className="mcq-fields">
              <p>Choix de réponses :</p>
              {choices.map((c, i) => (
                <div key={i} style={{ marginBottom: "5px", display: "flex", gap: "10px" }}>
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={answerIndex === i}
                    onChange={() => setAnswerIndex(i)}
                  />
                  <input
                    type="text"
                    required
                    placeholder={`Choix ${i + 1}`}
                    value={c}
                    onChange={(e) => {
                      const newChoices = [...choices];
                      newChoices[i] = e.target.value;
                      setChoices(newChoices);
                    }}
                    style={{ flex: 1, padding: "5px" }}
                  />
                </div>
              ))}
              <small style={{ color: "#aaa" }}>Cochez la bonne réponse.</small>
            </div>
          )}

          {type === "text" && (
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Réponse attendue:</label>
              <input
                type="text"
                required
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                style={{ width: "100%", padding: "8px" }}
              />
            </div>
          )}

          <button type="submit" style={{ marginTop: "1rem", padding: "10px 20px", background: "#4CAF50", color: "white", border: "none", cursor: "pointer" }}>
            Ajouter la question
          </button>
        </form>
      </div>

      <div className="questions-list">
        <h3>Questions existantes ({questions.length})</h3>
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {questions.map((q) => (
              <li key={q.id} style={{  background: "#333", border: "1px solid #444", marginBottom: "10px", padding: "10px", borderRadius: "5px", display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <strong>[{q.type === 'text' ? 'TEXT' : 'QCM'}]</strong> {q.question}
                  <br />
                  <small style={{ color: "#aaa" }}>
                    {q.type === 'mcq' 
                      ? `Réponse: ${q.choices[q.answerIndex]}` 
                      : `Réponse: ${q.answer}`}
                  </small>
                </div>
                <button 
                  onClick={() => handleDelete(q.id)}
                  style={{ background: "#ff4444", color: "white", border: "none", padding: "5px 10px", cursor: "pointer", marginLeft: "10px" }}
                >
                  X
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
