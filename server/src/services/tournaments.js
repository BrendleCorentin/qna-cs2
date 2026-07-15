import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const tournaments = new Map();
const matchToTournament = new Map();
const storePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../db/tournaments-state.db");

function saveTournaments() {
  const temporaryPath = `${storePath}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify([...tournaments.values()], null, 2));
  fs.renameSync(temporaryPath, storePath);
}

function loadTournaments() {
  if (!fs.existsSync(storePath)) return;
  try {
    const stored = JSON.parse(fs.readFileSync(storePath, "utf8"));
    for (const tournament of stored) {
      for (const match of tournament.rounds.flat()) {
        if (["playing", "waiting_players"].includes(match.status)) {
          match.status = "pending";
          match.gameMatchId = null;
        }
      }
      tournaments.set(tournament.code, tournament);
    }
  } catch (error) {
    console.error("[Tournament] Impossible de charger les tournois:", error.message);
  }
}

loadTournaments();

function makeCode() {
  let code;
  do code = crypto.randomBytes(3).toString("hex").toUpperCase();
  while (tournaments.has(code));
  return code;
}

function publicTournament(tournament) {
  return {
    code: tournament.code,
    name: tournament.name,
    creator: tournament.creator,
    maxPlayers: tournament.maxPlayers,
    status: tournament.status,
    champion: tournament.champion || null,
    players: tournament.players.map(({ username }) => ({ username })),
    rounds: tournament.rounds.map((round) => round.map((match) => ({
      id: match.id,
      round: match.round,
      player1: match.player1,
      player2: match.player2,
      winner: match.winner || null,
      status: match.status,
      gameMatchId: match.gameMatchId || null,
    }))),
  };
}

function broadcast(io, tournament) {
  saveTournaments();
  io.to(`tournament:${tournament.code}`).emit("tournamentUpdated", publicTournament(tournament));
}

function findPlayerSocket(io, username) {
  return [...io.sockets.sockets.values()].find(
    (candidate) => candidate.data.user?.username === username
  );
}

function shuffle(values) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildFirstRound(tournament) {
  const players = shuffle(tournament.players.map((player) => player.username));
  const bracketSize = 2 ** Math.ceil(Math.log2(players.length));
  while (players.length < bracketSize) players.push(null);

  return Array.from({ length: bracketSize / 2 }, (_, index) => ({
    id: `${tournament.code}-R1-M${index + 1}`,
    round: 1,
    player1: players[index * 2],
    player2: players[index * 2 + 1],
    winner: null,
    status: "pending",
    gameMatchId: null,
  }));
}

function createNextRound(tournament) {
  const current = tournament.rounds[tournament.rounds.length - 1];
  if (!current.length || current.some((match) => !match.winner)) return null;
  if (current.length === 1) {
    tournament.status = "finished";
    tournament.champion = current[0].winner;
    return null;
  }

  const roundNumber = tournament.rounds.length + 1;
  const next = [];
  for (let index = 0; index < current.length; index += 2) {
    next.push({
      id: `${tournament.code}-R${roundNumber}-M${next.length + 1}`,
      round: roundNumber,
      player1: current[index].winner,
      player2: current[index + 1].winner,
      winner: null,
      status: "pending",
      gameMatchId: null,
    });
  }
  tournament.rounds.push(next);
  return next;
}

async function launchPendingMatches(io, tournament, launchMatch) {
  if (tournament.status !== "running") return;
  const round = tournament.rounds[tournament.rounds.length - 1];

  for (const match of round) {
    if (match.status !== "pending") continue;
    if (!match.player1 || !match.player2) {
      match.winner = match.player1 || match.player2;
      match.status = "finished";
      continue;
    }

    const socket1 = findPlayerSocket(io, match.player1);
    const socket2 = findPlayerSocket(io, match.player2);
    if (!socket1 || !socket2) {
      match.status = "waiting_players";
      continue;
    }

    const gameMatchId = await launchMatch(socket1.id, socket2.id, {
      tournamentCode: tournament.code,
      tournamentMatchId: match.id,
    });
    match.gameMatchId = gameMatchId;
    match.status = "playing";
    matchToTournament.set(gameMatchId, { code: tournament.code, bracketMatchId: match.id });
  }

  if (round.every((match) => match.winner)) {
    createNextRound(tournament);
    await launchPendingMatches(io, tournament, launchMatch);
  }
  broadcast(io, tournament);
}

export function attachTournamentHandlers(io, socket, launchMatch) {
  socket.on("createTournament", async ({ name, maxPlayers = 16 } = {}, callback = () => {}) => {
    const creator = socket.data.user?.username;
    if (!creator) return callback({ success: false, error: "Connexion requise" });
    const size = Number(maxPlayers);
    if (![4, 8, 16, 32].includes(size)) {
      return callback({ success: false, error: "Taille autorisée : 4, 8, 16 ou 32 joueurs" });
    }

    const code = makeCode();
    const tournament = {
      code,
      name: String(name || "Tournoi CounterQuiz").trim().slice(0, 60),
      creator,
      maxPlayers: size,
      status: "registration",
      champion: null,
      players: [{ username: creator }],
      rounds: [],
    };
    tournaments.set(code, tournament);
    saveTournaments();
    socket.join(`tournament:${code}`);
    callback({ success: true, tournament: publicTournament(tournament) });
    broadcast(io, tournament);
  });

  socket.on("joinTournament", async ({ code } = {}, callback = () => {}) => {
    const username = socket.data.user?.username;
    const tournament = tournaments.get(String(code || "").toUpperCase());
    if (!username) return callback({ success: false, error: "Connexion requise" });
    if (!tournament) return callback({ success: false, error: "Tournoi introuvable" });
    if (tournament.status !== "registration") return callback({ success: false, error: "Inscriptions fermées" });
    if (tournament.players.length >= tournament.maxPlayers) return callback({ success: false, error: "Tournoi complet" });
    if (!tournament.players.some((player) => player.username === username)) {
      tournament.players.push({ username });
    }
    socket.join(`tournament:${tournament.code}`);
    callback({ success: true, tournament: publicTournament(tournament) });
    broadcast(io, tournament);
  });

  socket.on("watchTournament", ({ code } = {}, callback = () => {}) => {
    const tournament = tournaments.get(String(code || "").toUpperCase());
    if (!tournament) return callback({ success: false, error: "Tournoi introuvable" });
    socket.join(`tournament:${tournament.code}`);
    callback({ success: true, tournament: publicTournament(tournament) });
  });

  socket.on("startTournament", async ({ code } = {}, callback = () => {}) => {
    const tournament = tournaments.get(String(code || "").toUpperCase());
    if (!tournament) return callback({ success: false, error: "Tournoi introuvable" });
    if (socket.data.user?.username !== tournament.creator) return callback({ success: false, error: "Créateur requis" });
    if (tournament.players.length < 2) return callback({ success: false, error: "Deux joueurs minimum" });
    if (tournament.status !== "registration") return callback({ success: false, error: "Tournoi déjà lancé" });

    tournament.rounds = [buildFirstRound(tournament)];
    tournament.status = "running";
    await launchPendingMatches(io, tournament, launchMatch);
    callback({ success: true, tournament: publicTournament(tournament) });
  });

  socket.on("refreshTournamentMatches", async ({ code } = {}, callback = () => {}) => {
    const tournament = tournaments.get(String(code || "").toUpperCase());
    if (!tournament) return callback({ success: false, error: "Tournoi introuvable" });
    await launchPendingMatches(io, tournament, launchMatch);
    callback({ success: true, tournament: publicTournament(tournament) });
  });
}

export async function reportTournamentResult(io, gameMatchId, winner, launchMatch) {
  const ref = matchToTournament.get(gameMatchId);
  if (!ref || !winner) return;
  const tournament = tournaments.get(ref.code);
  if (!tournament) return;
  const bracketMatch = tournament.rounds.flat().find((match) => match.id === ref.bracketMatchId);
  if (!bracketMatch || bracketMatch.winner) return;

  bracketMatch.winner = winner;
  bracketMatch.status = "finished";
  matchToTournament.delete(gameMatchId);

  const round = tournament.rounds[tournament.rounds.length - 1];
  if (round.every((match) => match.winner)) createNextRound(tournament);
  await launchPendingMatches(io, tournament, launchMatch);
  broadcast(io, tournament);
}

export async function replayTournamentDraw(io, gameMatchId, launchMatch) {
  const ref = matchToTournament.get(gameMatchId);
  if (!ref) return;
  const tournament = tournaments.get(ref.code);
  const bracketMatch = tournament?.rounds.flat().find((match) => match.id === ref.bracketMatchId);
  if (!tournament || !bracketMatch) return;
  matchToTournament.delete(gameMatchId);
  bracketMatch.status = "pending";
  bracketMatch.gameMatchId = null;
  await launchPendingMatches(io, tournament, launchMatch);
}
