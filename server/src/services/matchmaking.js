import { makeId } from "../utils/id.js";
// QUESTIONS import removed, we use DB now
import { logMatchResult, registerUser, loginUser, getUserByUsername, updateUserElo, getLeaderboard, getRandomQuestions } from "../db/database.js";
import { calculateElo } from "../utils/elo.js";

// Levenshtein distance helper for fuzzy matching
function getLevenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  // increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

let waitingSocketId = null;
const matches = new Map();
const QUESTION_DURATION = 10000;

function startNextQuestion(io, match) {
  if (match.timer) clearTimeout(match.timer);
  if (match.ended) return;
  
  match.currentQuestionIndex++;
  
  if (match.currentQuestionIndex >= match.questions.length) {
    if (!match.ended) { 
        endMatch(io, match);
        // Clean up match after a short delay to allow for any late acks or disconnects
        setTimeout(() => {
            matches.delete(match.matchId);
        }, 5000);
    }
    return;
  }

  const question = match.questions[match.currentQuestionIndex];
  
  // Safety check: ensure question exists
  if (!question) {
      console.error(`Match ${match.matchId}: Question at index ${match.currentQuestionIndex} is undefined.`);
      endMatch(io, match);
      return;
  }

  // Dynamic duration based on question type
  const duration = question.type === 'progressive_clue' ? 20000 : 10000;
  const deadline = Date.now() + duration;

  io.to(match.matchId).emit("nextQuestion", {
    index: match.currentQuestionIndex,
    id: question.id,
    deadline,
    duration // Send duration to help client sync
  });

  // Clear any existing timer to avoid overlaps if called manually
  if (match.timer) clearTimeout(match.timer);

  match.timer = setTimeout(() => {
    startNextQuestion(io, match);
  }, duration + 1000); // 1s buffer
}

export function attachMatchmaking(io) {
  io.on("connection", (socket) => {
    // Auth listeners
    socket.on("register", async ({ username, password }, cb) => {
        try {
            if (!username || !password) throw new Error("Champs manquants");
            await registerUser(username, password);
            cb({ success: true });
        } catch (e) {
            cb({ success: false, error: e.message });
        }
    });

    socket.on("login", async ({ username, password }, cb) => {
        try {
            const user = await loginUser(username, password);
             // Store user in socket session
            socket.data.user = user;
            socket.data.nickname = user.username;
            socket.data.elo = user.elo;
            
            cb({ success: true, user: { username: user.username, elo: user.elo } });
        } catch (e) {
            cb({ success: false, error: e.message });
        }
    });

    socket.on("getLeaderboard", async (cb) => {
        try {
            const leaderboard = await getLeaderboard(50);
            cb(leaderboard);
        } catch (e) {
            console.error(e);
            cb([]);
        }
    });

    socket.on("startSolo", async ({ nickname }) => {
        socket.data.nickname = nickname;
        const matchId = makeId(10);
        socket.join(matchId);

        let questions = [];
        try {
            questions = await getRandomQuestions(5);
        } catch (e) {
            questions = [];
        }

        const match = {
            matchId,
            players: [socket.id],
            nicknames: {
                [socket.id]: nickname,
            },
            elos: {
                [socket.id]: socket.data.elo || 1000,
            },
            isRanked: false, // Solo is never ranked
            isSolo: true,
            startedAt: Date.now(),
            ended: false,
            currentQuestionIndex: -1,
            timer: null,
            answers: {
                [socket.id]: {},
            },
            scores: {
                [socket.id]: 0,
            },
            questions,
        };

        matches.set(matchId, match);

        const clientQuestions = questions.map(({ id, question, choices, type }) => ({ id, question, choices, type }));

        socket.emit("matchFound", {
            matchId,
            you: { id: socket.id, nickname: nickname, elo: match.elos[socket.id] },
            opponent: { id: "bot", nickname: "Bot d'Entraînement", elo: 0 },
            questions: clientQuestions,
            startedAt: match.startedAt,
        });

        setTimeout(() => {
            startNextQuestion(io, match);
        }, 1000);
    });

    socket.on("joinQueue", async () => {
      // Require login? For now let's say "Guest" if not logged in, but user asked for login system.
      // If not logged in, create a guest profile or force login.
      // Let's support guests too for backward compat, but ELO only for logged users.
      
      const isGuest = !socket.data.user;
      const nickname = socket.data.nickname || `Guest-${makeId(4)}`;
      socket.data.nickname = nickname;
      
      if (isGuest) {
          // Default ELO for matchmaking logic if we had one, but we don't use it for matching yet
          socket.data.elo = 1000; 
      }

      if (!waitingSocketId) {
        socket.join(socket.id); // ensure joined own room? Not needed usually but ok
        waitingSocketId = socket.id;
        socket.emit("queueStatus", { status: "waiting" });
        return;
      }

      if (waitingSocketId === socket.id) return;

      const a = waitingSocketId;
      const b = socket.id;
      waitingSocketId = null;

      const matchId = makeId(10);
      
      // Join a room for easier broadcasting
      const socketA = io.sockets.sockets.get(a);
      const socketB = io.sockets.sockets.get(b);
      
      if (socketA) socketA.join(matchId);
      if (socketB) socketB.join(matchId);

      let questions = [];
      try {
          questions = await getRandomQuestions(5);
      } catch (e) {
          console.error("Error fetching questions:", e);
          // Fallback if needed, or abort match
          questions = [];
      }

      const match = {
        matchId,
        players: [a, b],
        nicknames: {
          [a]: socketA?.data.nickname || "Player 1",
          [b]: socketB?.data.nickname || "Player 2",
        },
        elos: {
          [a]: socketA?.data.elo || 1000,
          [b]: socketB?.data.elo || 1000,
        },
        isRanked: socketA?.data.user && socketB?.data.user,
        startedAt: Date.now(),
        ended: false,
        currentQuestionIndex: -1,
        timer: null,
        answers: {
          [a]: {},
          [b]: {},
        },
        scores: {
          [a]: 0,
          [b]: 0,
        },
        questions, // Add questions directly to match object
      };

      matches.set(matchId, match);

      // Prepare sanitized questions for client
      const clientQuestions = questions.map(({ id, question, choices, type, clues }) => ({ 
          id, 
          question, 
          choices, 
          type,
          clues // Include clues for progressive questions
      }));

      io.to(a).emit("matchFound", {
        matchId,
        you: { id: a, nickname: match.nicknames[a], elo: match.elos[a] },
        opponent: { id: b, nickname: match.nicknames[b], elo: match.elos[b] },
        questions: clientQuestions,
        startedAt: match.startedAt,
      });

      io.to(b).emit("matchFound", {
        matchId,
        you: { id: b, nickname: match.nicknames[b], elo: match.elos[b] },
        opponent: { id: a, nickname: match.nicknames[a], elo: match.elos[a] },
        questions: clientQuestions,
        startedAt: match.startedAt,
      });

      // Start the first question after a short delay
      setTimeout(() => {
        startNextQuestion(io, match);
      }, 1000);
    });

    socket.on("answer", ({ matchId, questionId, answer }) => {
      const match = matches.get(matchId);
      if (!match || match.ended) return;
      if (!match.players.includes(socket.id)) return;

      // Only accept answers for the current question
      const currentQ = match.questions[match.currentQuestionIndex];
      // Convert both IDs to string for comparison to avoid type mismatch
      if (!currentQ || String(currentQ.id) !== String(questionId)) {
          console.warn(`[Match ${matchId}] Invalid question ID. Expected ${currentQ?.id}, got ${questionId}`);
          return;
      }

      // prevent double answer
      if (match.answers[socket.id]?.[questionId] !== undefined) {
        // Already answered, just re-send ack in case client missed it
        const existingAns = match.answers[socket.id][questionId];
        let wasCorrect = false;
        if (currentQ.type === 'text' || currentQ.type === 'progressive_clue') {
            const submitted = (typeof existingAns === 'string' ? existingAns : "").trim().toLowerCase();
            const expected = (currentQ.answer || "").trim().toLowerCase();
            const dist = getLevenshteinDistance(submitted, expected);
            wasCorrect = dist <= 1; // Allow 1 typo
        } else {
             wasCorrect = existingAns === currentQ.answerIndex;
        }
        
        socket.emit("answerAck", {
            questionId,
            correct: wasCorrect,
            score: match.scores[socket.id],
        });
        return;
      }

      const q = currentQ;
      let correct = false;

      // Check answer type
      let validAnswer = true;

      if (q.type === 'text' || q.type === 'progressive_clue') {
          const submitted = (typeof answer === 'string' ? answer : "").trim().toLowerCase();
          const expected = (q.answer || "").trim().toLowerCase();
          
          const dist = getLevenshteinDistance(submitted, expected);
          correct = dist <= 1; // Allow 1 typo
          match.answers[socket.id][questionId] = answer;
      } else {
          // Default to MCQ
          const idx = Number(answer);
          if (!Number.isInteger(idx) || idx < 0 || idx >= (q.choices ? q.choices.length : 0)) {
              validAnswer = false;
          } else {
              match.answers[socket.id][questionId] = idx;
              correct = idx === q.answerIndex;
          }
      }

      if (!validAnswer) {
          console.warn(`[Match ${matchId}] Invalid answer index: ${answer}`);
          // Send ack with error/false to unblock client
           socket.emit("answerAck", {
            questionId,
            correct: false,
            score: match.scores[socket.id],
          });
          return;
      }

      // Send Ack FIRST before moving to next question (to ensure client processes it)
      socket.emit("answerAck", {
        questionId,
        correct,
        score: match.scores[socket.id],
      });

      const opp = getOpponent(match, socket.id);
      if (opp) {
        io.to(opp).emit("opponentAnswered", { questionId });
      }

      if (correct) {
        match.scores[socket.id] += 1;
        
        // If correct answer, move to next question with a small delay
        setTimeout(() => {
            if (match.ended) return;
            // Only proceed if we are still on the same question index
            // (Use simple index check)
            const currentIndex = match.questions.indexOf(currentQ);
            if (match.currentQuestionIndex === currentIndex) {
                 startNextQuestion(io, match);
            }
        }, 1000); 
      } 
      
    });

      // --- SEND EMOTE (Chat rapide) ---
    socket.on("sendEmote", ({ matchId, message }) => {
        const match = matches.get(matchId);
        if (!match) return;

        const senderNickname = socket.data.nickname || `Guest`; // Utiliser le nickname stocké dans socket.data

        // Envoyer à tout le monde dans la room (donc l'adversaire ET soi-même pour confirmation visuelle)
        io.to(matchId).emit("emoteReceived", {
            senderId: socket.id,
            nickname: senderNickname,
            message: message.substring(0, 30) // Limite de caractères par sécurité
        });
    });

    socket.on("leaveMatch", ({ matchId }) => {
      const match = matches.get(matchId);
      if (!match || match.ended) return;
      if (!match.players.includes(socket.id)) return;

      const opp = getOpponent(match, socket.id);
      match.ended = true;

      // Extract nicknames before deleting
      const p1 = socket.id;
      const n1 = match.nicknames[p1];
      
      const p2 = opp || 'bot';
      const n2 = opp ? match.nicknames[p2] : "Bot d'Entraînement";
      
      const s1 = match.scores[p1];
      const s2 = opp ? match.scores[p2] : 0;

      // Log database (only if not solo or if we want to log practice)
      if (!match.isSolo) {
            logMatchResult({
                matchId,
                player1: n1,
                player2: n2,
                score1: s1,
                score2: s2,
                winner: n2, // opponent won because player left
                reason: "abandon"
            });

            if(opp) io.to(opp).emit("matchEnd", { result: "win", reason: "opponent_left" });
      }

      // If solo, just end it 
      if (match.isSolo) {
           // Maybe nothing needed here if we just delete it
      }

      io.to(socket.id).emit("matchEnd", { result: "lose", reason: "left" });

      matches.delete(matchId);
    });

    socket.on("leaveQueue", () => {
      console.log(`[Queue] User ${socket.id} left queue.`);
      if (waitingSocketId === socket.id) {
        waitingSocketId = null;
        socket.emit("queueStatus", { status: "left" });
      }
    });

    socket.on("disconnect", () => {
      if (waitingSocketId === socket.id) waitingSocketId = null;

      // if in match -> opponent wins
      for (const [mid, match] of matches.entries()) {
        if (match.ended) continue;
        if (!match.players.includes(socket.id)) continue;

        if (match.isSolo) {
            matches.delete(mid);
            continue;
        }

        const opp = getOpponent(match, socket.id);
        match.ended = true;

        const p1 = socket.id;
        const p2 = opp;
        const n1 = match.nicknames[p1];
        const n2 = match.nicknames[p2];
        const s1 = match.scores[p1];
        const s2 = match.scores[p2];

        logMatchResult({
            matchId: mid,
            player1: n1,
            player2: n2,
            score1: s1,
            score2: s2,
            winner: n2,
            reason: "disconnect"
        });

        // ELO penalty for disconnect? For now let's treat it as a loss if ranked
        // But since we are inside a loop and async might be tricky, let's keep it simple: no ELO update on disconnect for now,
        // OR better: treat as loss.
        if (match.isRanked) {
             const actualScoreA = 0; // p1 disconnected -> loss
             const [nA, nB] = calculateElo(match.elos[p1], match.elos[p2], actualScoreA);
             updateUserElo(n1, nA).catch(console.error);
             updateUserElo(n2, nB).catch(console.error);
        }

        io.to(opp).emit("matchEnd", { result: "win", reason: "opponent_disconnected" });
        matches.delete(mid);
      }
    });
  });
}

function getOpponent(match, sid) {
  if (match.isSolo) return null; // Solo mode
  const [a, b] = match.players;
  return sid === a ? b : a;
}

function isAllAnswered(match) {
  return match.players.every((pid) => {
    const a = match.answers[pid];
    return match.questions.every((q) => a[q.id] !== undefined);
  });
}

function endMatch(io, match) {
  match.ended = true;

  if (match.isSolo) {
      const pid = match.players[0];
      const score = match.scores[pid];
      
      // No ELO for solo
      io.to(pid).emit("matchEnd", { 
          result: "win", // Or just 'finished'
          yourScore: score, 
          oppScore: 0,
          elo: match.elos[pid],
          eloChange: 0,
          isSolo: true
      });
      return;
  }

  const [a, b] = match.players;

  const sa = match.scores[a];
  const sb = match.scores[b];
  
  let resultA = "draw";
  let resultB = "draw";
  
  if (sa > sb) {
      resultA = "win";
      resultB = "loss";
  } else if (sb > sa) {
      resultA = "loss";
      resultB = "win";
  }
  
  // Calculate ELO if ranked
  let newEloA = match.elos[a];
  let newEloB = match.elos[b];
  let eloChangeA = 0;
  let eloChangeB = 0;

  if (match.isRanked) {
      const actualScoreA = sa > sb ? 1 : sa < sb ? 0 : 0.5;
      const [nA, nB] = calculateElo(match.elos[a], match.elos[b], actualScoreA);
      
      eloChangeA = nA - match.elos[a];
      eloChangeB = nB - match.elos[b];
      
      newEloA = nA;
      newEloB = nB;

      // Update DB asynchronously
      updateUserElo(match.nicknames[a], newEloA).catch(console.error);
      updateUserElo(match.nicknames[b], newEloB).catch(console.error);
      
      // Update socket data if still connected
      const sockA = io.sockets.sockets.get(a);
      if (sockA) sockA.data.elo = newEloA;
      
      const sockB = io.sockets.sockets.get(b);
      if (sockB) sockB.data.elo = newEloB;
  }

  // Determine winner name
  let winnerName = "draw";
  if (sa > sb) winnerName = match.nicknames[a];
  else if (sb > sa) winnerName = match.nicknames[b];

  logMatchResult({
    matchId: match.matchId,
    player1: match.nicknames[a],
    player2: match.nicknames[b],
    score1: sa,
    score2: sb,
    winner: winnerName,
    reason: "normal"
  });

  io.to(a).emit("matchEnd", { 
      result: resultA, 
      yourScore: sa, 
      oppScore: sb,
      elo: newEloA,
      eloChange: eloChangeA
  });
  
  io.to(b).emit("matchEnd", { 
      result: resultB, 
      yourScore: sb, 
      oppScore: sa,
      elo: newEloB,
      eloChange: eloChangeB
  });
}
