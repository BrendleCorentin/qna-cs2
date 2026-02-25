import { useEffect, useState } from "react";
import { useSocket } from "./hooks/useSocket.js";

import Lobby from "./components/Lobby.jsx";
import Queue from "./components/Queue.jsx";
import Match from "./components/Match.jsx";
import Result from "./components/Result.jsx";
import Leaderboard from "./components/Leaderboard.jsx";

// CONFIGURATION POUR NGINX REVERSE PROXY
// Force l'utilisation de l'IP sans port pour éviter tout conflit avec des fichiers .env existants
const SERVER_URL = "http://51.68.139.39"; 

export default function App() {
  const socketRef = useSocket(SERVER_URL);

  const [user, setUser] = useState(null); // { username, elo }
  const [nickname, setNickname] = useState("");
  const [phase, setPhase] = useState("lobby"); // lobby | queue | match | end

  const [queueStatus, setQueueStatus] = useState("");
  const [match, setMatch] = useState(null); // { matchId, opponent, questions }
  const [qIndex, setQIndex] = useState(0);

  const [myScore, setMyScore] = useState(0);
  const [answered, setAnswered] = useState({}); // questionId -> { choiceIndex, correct }
  const [opponentAnswered, setOpponentAnswered] = useState({}); // questionId -> true
  const [deadline, setDeadline] = useState(null); // timestamp for next question
  const [endInfo, setEndInfo] = useState(null);

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

    const onNextQuestion = ({ index, deadline }) => {
      setQIndex(index);
      // Optional: Store deadline in state to show a timer
      setDeadline(deadline); 
    };

    const onMatchEnd = (msg) => {
      setEndInfo(msg);
      setPhase("end");
    };

    s.on("queueStatus", onQueueStatus);
    s.on("matchFound", onMatchFound);
    s.on("answerAck", onAnswerAck);
    s.on("opponentAnswered", onOpponentAnswered);
    s.on("nextQuestion", onNextQuestion);
    s.on("matchEnd", onMatchEnd);

    return () => {
      s.off("queueStatus", onQueueStatus);
      s.off("matchFound", onMatchFound);
      s.off("answerAck", onAnswerAck);
      s.off("opponentAnswered", onOpponentAnswered);
      s.off("nextQuestion", onNextQuestion);
      s.off("matchEnd", onMatchEnd);
    };
  }, [socketRef]);

  function joinQueue() {
    const s = socketRef.current;
    if (!s) return;
    s.emit("joinQueue", { nickname: nickname || "Player" });
    setPhase("queue");
  }

  function answer(questionId, choiceIndex) {
    if (!match) return;
    if (answered[questionId]?.choiceIndex !== undefined) return;

    setAnswered((prev) => ({
      ...prev,
      [questionId]: { choiceIndex },
    }));

    socketRef.current?.emit("answer", {
      matchId: match.matchId,
      questionId,
      choiceIndex,
    });
  }

  function leaveMatch() {
    if (!match) return;
    socketRef.current?.emit("leaveMatch", { matchId: match.matchId });
  }

  function replay() {
    setMatch(null);
    setEndInfo(null);
    setPhase("lobby");
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
    return <Queue status={queueStatus} onBack={() => setPhase("lobby")} />;
  }

  if (phase === "match" && match) {
    return (
      <Match
        opponentName={match.opponent.nickname}
        questions={match.questions}
        qIndex={qIndex}
        deadline={deadline}
        answered={answered}
        opponentAnswered={opponentAnswered}
        myScore={myScore}
        onAnswer={answer}
        onLeave={leaveMatch}
      />
    );
  }

  if (phase === "end") {
    return <Result endInfo={endInfo} onReplay={replay} />;
  }

  return null;
}
