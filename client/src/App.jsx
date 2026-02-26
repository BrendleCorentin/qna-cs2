import { useEffect, useState } from "react";
import { useSocket } from "./hooks/useSocket.js";

import Lobby from "./components/Lobby.jsx";
import Queue from "./components/Queue.jsx";
import Match from "./components/Match.jsx";
import Result from "./components/Result.jsx";
import Leaderboard from "./components/Leaderboard.jsx";
import Admin from "./components/Admin.jsx";

// CONFIGURATION POUR NGINX REVERSE PROXY
// Utilisation du domaine sécurisé pour éviter les erreurs "Mixed Content"
const SERVER_URL = "https://counter-quiz.com"; 

export default function App() {
  const socketRef = useSocket(SERVER_URL);

  const [user, setUser] = useState(null); // { username, elo }
  const [nickname, setNickname] = useState("");
  const [phase, setPhase] = useState("lobby"); // lobby | queue | match | end | admin

  const [queueStatus, setQueueStatus] = useState("");
  const [match, setMatch] = useState(null); // { matchId, opponent, questions }
  const [qIndex, setQIndex] = useState(0);

  const [myScore, setMyScore] = useState(0);
  const [answered, setAnswered] = useState({}); // questionId -> { choiceIndex, correct }
  const [opponentAnswered, setOpponentAnswered] = useState({}); // questionId -> true
  const [deadline, setDeadline] = useState(null); // timestamp for next question
  const [endInfo, setEndInfo] = useState(null);
  
  // Emotes system
  const [activeEmote, setActiveEmote] = useState(null); // { senderId, message, id }

  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const onQueueStatus = (msg) => {
      setQueueStatus(msg.status);
      setPhase("queue");
    };

    const onMatchFound = (msg) => {
      setMatch({
        matchId: msg.matchId,
        opponent: msg.opponent,
        questions: msg.questions,
      });
      setQIndex(0);
      setMyScore(0);
      setAnswered({});
      setOpponentAnswered({});
      setEndInfo(null);
      // Reset Emotes
      setActiveEmote(null);
      setPhase("match");
    };

    const onAnswerAck = (msg) => {
      setMyScore(msg.score);
      setAnswered((prev) => ({
        ...prev,
        [msg.questionId]: { ...(prev[msg.questionId] || {}), correct: msg.correct },
      }));
    };

    const onOpponentAnswered = ({ questionId }) => {
      setOpponentAnswered((prev) => ({ ...prev, [questionId]: true }));
    };

    const onEmoteReceived = (msg) => {
       // msg = { senderId, nickname, message }
       // On remplace l'emote active (une seule à la fois pour simplifier l'affichage)
       // On ajoute un timestamp unique pour forcer le re-render si même message
       setActiveEmote({ ...msg, id: Date.now() });
       
       // Auto-clear after 3s
       setTimeout(() => {
           setActiveEmote(current => (current && current.id === msg.id ? null : current));
       }, 3000);
    };

    const onNextQuestion = ({ index, deadline }) => {
      setQIndex(index);
      // Optional: Store deadline in state to show a timer
      setDeadline(deadline); 
    };

    const onMatchEnd = (msg) => {
      console.log("Match ended:", msg);
      setEndInfo(msg);
      setPhase("end");
    };

    s.on("queueStatus", onQueueStatus);
    s.on("matchFound", onMatchFound);
    s.on("answerAck", onAnswerAck);
    s.on("opponentAnswered", onOpponentAnswered);
    s.on("emoteReceived", onEmoteReceived);
    s.on("nextQuestion", onNextQuestion);
    s.on("matchEnd", onMatchEnd);

    return () => {
      s.off("queueStatus", onQueueStatus);
      s.off("matchFound", onMatchFound);
      s.off("answerAck", onAnswerAck);
      s.off("opponentAnswered", onOpponentAnswered);
      s.off("emoteReceived", onEmoteReceived);
      s.off("nextQuestion", onNextQuestion);
      s.off("matchEnd", onMatchEnd);
    };
  }, [socketRef]);

  function joinQueue(isSolo = false) {
    const s = socketRef.current;
    if (!s) return;
    
    if (isSolo) {
        s.emit("startSolo", { nickname: nickname || "Player" });
    } else {
        s.emit("joinQueue", { nickname: nickname || "Player" });
        setPhase("queue");
    }
  }

  function answer(questionId, ans) {
    if (!match) return;
    if (answered[questionId]?.answer !== undefined) return;

    setAnswered((prev) => ({
      ...prev,
      [questionId]: { answer: ans },
    }));

    socketRef.current?.emit("answer", {
      matchId: match.matchId,
      questionId,
      answer: ans,
    });
  }

  function sendEmote(message) {
      if(!match) return;
      socketRef.current?.emit("sendEmote", {
          matchId: match.matchId,
          message
      });
  }

  function leaveMatch() {
    if (!match) return;
    socketRef.current?.emit("leaveMatch", { matchId: match.matchId });
    setPhase("lobby");
  }
  
  function leaveQueue() {
    if (phase !== "queue") return;
    socketRef.current?.emit("leaveQueue");
    setPhase("lobby");
  }

  function replay() {
    setMatch(null);
    setEndInfo(null);
    setActiveEmote(null);
    setPhase("lobby");
  }

  if (phase === "admin") {
    return <Admin serverUrl={SERVER_URL} onBack={() => setPhase("lobby")} />;
  }

  if (phase === "lobby") {
    return (
      <Lobby
        socket={socketRef.current}
        user={user}
        setUser={setUser}
        nickname={nickname}
        setNickname={setNickname}
        onPlay={joinQueue}
        onLeaderboard={() => setPhase("leaderboard")}
        onAdmin={() => setPhase("admin")}
      />
    );
  }

  if (phase === "leaderboard") {
    return (
        <Leaderboard 
            socket={socketRef.current} 
            onBack={() => setPhase("lobby")} 
        />
    );
  }

  if (phase === "queue") {
    return <Queue status={queueStatus} onBack={leaveQueue} />;
  }

  if (phase === "match" && match) {
    return (
      <Match
        // Player Info
        opponentName={match.opponent.nickname}
        opponentId={match.opponent.id} // NEW: Needed to know who sent emote
        myId={socketRef.current?.id}   // NEW: Needed to know who sent emote

        // Game State
        questions={match.questions}
        qIndex={qIndex}
        deadline={deadline}
        
        // Answers & Scores
        answered={answered}
        opponentAnswered={opponentAnswered}
        myScore={myScore}
        
        // Actions
        onAnswer={answer}
        onLeave={leaveMatch}
        
        // Emotes
        activeEmote={activeEmote}
        onSendEmote={sendEmote}
      />
    );
  }

  if (phase === "end") {
    return <Result endInfo={endInfo} onReplay={replay} />;
  }

  return null;
}
