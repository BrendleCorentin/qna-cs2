import { useState, useEffect } from "react";

export default function Admin({ serverUrl, onBack }) {
  // On considère que si on arrive ici, c'est qu'on a passé le check du Lobby
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // New Question Form State
  const [type, setType] = useState("mcq"); // mcq | text
  const [questionText, setQuestionText] = useState("");
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [answerIndex, setAnswerIndex] = useState(0);
  const [textAnswer, setTextAnswer] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, []);

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

  return (
    <div className="cs-container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
      <div
        className="cs-card"
        style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            borderBottom: "1px solid var(--cs-border)",
            paddingBottom: "1rem",
          }}
        >
          <h1
            className="cs-hero-title"
            style={{ fontSize: "2rem", margin: 0, borderLeft: "none" }}
          >
            ADMINISTRA<span style={{ color: "var(--cs-accent)" }}>TION</span>
          </h1>
          <button className="cs-btn" onClick={onBack}>
            RETOUR AU JEU
          </button>
        </div>

        <div
          style={{
            background: "rgba(0,0,0,0.3)",
            padding: "1.5rem",
            borderRadius: "4px",
            marginBottom: "2rem",
            border: "1px solid var(--cs-border)",
          }}
        >
          <h3 style={{ marginTop: 0, color: "var(--cs-accent)" }}>
            AJOUTER UNE QUESTION
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="cs-input-group">
              <label className="cs-label">TYPE DE QUESTION</label>
              <select
                className="cs-input"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="mcq">QCM (4 choix)</option>
                <option value="text">Texte Libre (Qui suis-je ?)</option>
              </select>
            </div>

            <div className="cs-input-group">
              <label className="cs-label">ÉNONCÉ DE LA QUESTION</label>
              <textarea
                className="cs-input"
                required
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                style={{ height: "100px", resize: "vertical" }}
                placeholder="Posez votre question ici..."
              />
            </div>

            {type === "mcq" && (
              <div style={{ marginBottom: "1.5rem" }}>
                <label className="cs-label" style={{ marginBottom: "0.5rem" }}>
                  CHOIX DE RÉPONSES (Coche la bonne)
                </label>
                {choices.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginBottom: "10px",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={answerIndex === i}
                      onChange={() => setAnswerIndex(i)}
                      style={{
                        accentColor: "var(--cs-accent)",
                        transform: "scale(1.5)",
                        cursor: "pointer",
                      }}
                    />
                    <input
                      type="text"
                      className="cs-input"
                      required
                      placeholder={`Choix n°${i + 1}`}
                      value={c}
                      onChange={(e) => {
                        const newChoices = [...choices];
                        newChoices[i] = e.target.value;
                        setChoices(newChoices);
                      }}
                      style={{ flex: 1 }}
                    />
                  </div>
                ))}
              </div>
            )}

            {type === "text" && (
              <div className="cs-input-group">
                <label className="cs-label">RÉPONSE ATTENDUE</label>
                <input
                  type="text"
                  className="cs-input"
                  required
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="La réponse exacte..."
                />
              </div>
            )}

            <button
              type="submit"
              className="cs-btn cs-btn-primary"
              style={{ width: "100%" }}
            >
              ENREGISTRER LA QUESTION
            </button>
          </form>
        </div>

        <div>
          <h3
            style={{
              borderBottom: "1px solid var(--cs-border)",
              paddingBottom: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            QUESTIONS EN BASE ({questions.length})
          </h3>
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem", opacity: 0.7 }}>
              Chargement des questions...
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {questions.length === 0 && (
                <div style={{ textAlign: "center", opacity: 0.5, padding: "2rem" }}>
                  Aucune question trouvée. Ajoutez-en une !
                </div>
              )}
              {questions.map((q) => (
                <div
                  key={q.id}
                  style={{
                    background: "#1e1e24",
                    border: "1px solid #333",
                    padding: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderRadius: "4px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
                      <span
                        style={{
                          background: q.type === "text" ? "#9c27b0" : "var(--cs-accent)",
                          color: "black",
                          fontWeight: "bold",
                          fontSize: "0.7rem",
                          padding: "2px 6px",
                          borderRadius: "2px",
                        }}
                      >
                        {q.type === "text" ? "TEXT" : "QCM"}
                      </span>
                      <strong style={{ fontSize: "1.1rem" }}>{q.question}</strong>
                    </div>
                    
                    <div style={{ color: "var(--cs-text-muted)", fontSize: "0.9rem" }}>
                      <span style={{ color: "#4caf50", marginRight: "5px" }}>✔</span>
                      {q.type === "mcq"
                        ? q.choices[q.answerIndex]
                        : q.answer}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="cs-btn"
                    style={{
                        padding: "0.5rem",
                        background: "rgba(255, 68, 68, 0.2)",
                        color: "#ff4444",
                        border: "1px solid #ff4444",
                        marginLeft: "1rem"
                    }}
                    title="Supprimer"
                  >
                    SUPPRIMER
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
