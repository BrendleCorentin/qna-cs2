import { useEffect, useState } from "react";

export default function Tournament({ socket, user, initialCode, onActiveCode, onBack }) {
  const [tournament, setTournament] = useState(null);
  const [code, setCode] = useState(initialCode || "");
  const [name, setName] = useState("Tournoi du stream");
  const [maxPlayers, setMaxPlayers] = useState(16);
  const [error, setError] = useState("");
  const [liveMatches, setLiveMatches] = useState({});

  useEffect(() => {
    if (!socket) return;
    const update = (next) => {
      setTournament(next);
      setCode(next.code);
      onActiveCode(next.code);
    };
    socket.on("tournamentUpdated", update);
    const progress = (match) => setLiveMatches((current) => ({ ...current, [match.bracketMatchId]: match }));
    socket.on("tournamentMatchProgress", progress);
    if (initialCode) socket.emit("watchTournament", { code: initialCode }, (response) => {
      if (response?.success) update(response.tournament);
    });
    return () => {
      socket.off("tournamentUpdated", update);
      socket.off("tournamentMatchProgress", progress);
    };
  }, [socket, initialCode, onActiveCode]);

  const run = (event, payload) => {
    setError("");
    socket.emit(event, payload, (response) => {
      if (!response?.success) return setError(response?.error || "Erreur tournoi");
      setTournament(response.tournament);
      setCode(response.tournament.code);
      onActiveCode(response.tournament.code);
    });
  };

  if (!user) return (
    <div className="cs-container"><div className="cs-card"><h2>TOURNOIS</h2><p>Connecte-toi pour participer.</p><button className="cs-btn" onClick={onBack}>RETOUR</button></div></div>
  );

  return (
    <div className="cs-container" style={{ alignItems: "flex-start", paddingTop: 30 }}>
      <div className="cs-card" style={{ width: "min(1200px, 96vw)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 15, alignItems: "center" }}>
          <h1 className="cs-hero-title" style={{ border: 0 }}>MODE <span className="text-accent">TOURNOI</span></h1>
          <button className="cs-btn" onClick={onBack}>RETOUR</button>
        </div>

        {!tournament && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
          <section className="cs-panel" style={{ padding: 20 }}>
            <h3>CRÉER UN TOURNOI</h3>
            <input className="cs-input" value={name} onChange={(e) => setName(e.target.value)} />
            <select className="cs-input" value={maxPlayers} onChange={(e) => setMaxPlayers(Number(e.target.value))} style={{ marginTop: 10 }}>
              {[4, 8, 16, 32].map((size) => <option key={size} value={size}>{size} joueurs</option>)}
            </select>
            <button className="cs-btn cs-btn-primary" style={{ marginTop: 12 }} onClick={() => run("createTournament", { name, maxPlayers })}>CRÉER</button>
          </section>
          <section className="cs-panel" style={{ padding: 20 }}>
            <h3>REJOINDRE / REGARDER</h3>
            <input className="cs-input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CODE DU TOURNOI" maxLength={6} />
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button className="cs-btn cs-btn-primary" onClick={() => run("joinTournament", { code })}>REJOINDRE</button>
              <button className="cs-btn" onClick={() => run("watchTournament", { code })}>SPECTATEUR</button>
            </div>
          </section>
        </div>}

        {error && <p style={{ color: "var(--cs-t-red)", fontWeight: 700 }}>{error}</p>}

        {tournament && <>
          <div className="cs-panel" style={{ padding: 20, marginBottom: 20 }}>
            <h2 style={{ marginTop: 0 }}>{tournament.name}</h2>
            <p>CODE : <strong style={{ color: "var(--cs-accent)", fontSize: "1.4rem", letterSpacing: 3 }}>{tournament.code}</strong></p>
            <p>{tournament.players.length}/{tournament.maxPlayers} joueurs · {tournament.status}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{tournament.players.map((player) => <span className="cs-tag" key={player.username}>{player.username}</span>)}</div>
            {tournament.creator === user.username && tournament.status === "registration" &&
              <button className="cs-btn cs-btn-primary" style={{ marginTop: 15 }} onClick={() => run("startTournament", { code: tournament.code })}>LANCER LE TOURNOI</button>}
            {tournament.status === "running" && <button className="cs-btn" style={{ marginTop: 15 }} onClick={() => run("refreshTournamentMatches", { code: tournament.code })}>JE SUIS PRÊT</button>}
            {tournament.champion && <h2 style={{ color: "var(--cs-accent)" }}>🏆 {tournament.champion}</h2>}
          </div>

          <div style={{ display: "flex", gap: 24, overflowX: "auto", alignItems: "stretch", paddingBottom: 15 }}>
            {tournament.rounds.map((round, roundIndex) => <div key={roundIndex} style={{ minWidth: 250, display: "flex", flexDirection: "column", gap: 12 }}>
              <h3>ROUND {roundIndex + 1}</h3>
              {round.map((match) => <div className="cs-panel" key={match.id} style={{ padding: 14, borderColor: match.status === "playing" ? "var(--cs-accent)" : undefined }}>
                {liveMatches[match.id]?.status === "playing" && <div style={{ color: "#ff4d4d", fontWeight: 800, fontSize: 12 }}>● LIVE · Q{liveMatches[match.id].question}/{liveMatches[match.id].totalQuestions}</div>}
                <div style={{ fontWeight: match.winner === match.player1 ? 800 : 400 }}>{match.player1 || "BYE"} {liveMatches[match.id] ? `— ${liveMatches[match.id].score1}` : ""}</div>
                <div style={{ opacity: .5, margin: "4px 0" }}>VS</div>
                <div style={{ fontWeight: match.winner === match.player2 ? 800 : 400 }}>{match.player2 || "BYE"} {liveMatches[match.id] ? `— ${liveMatches[match.id].score2}` : ""}</div>
                <small style={{ color: "var(--cs-text-muted)" }}>{match.status}</small>
              </div>)}
            </div>)}
          </div>
        </>}
      </div>
    </div>
  );
}
