import fs from "fs";
import fse from "fs-extra";
import path from "path";
import { HLTV } from "hltv";

const OUT_DIR = path.resolve("./src/config");
const CACHE_DIR = path.resolve("./cache");

await fse.ensureDir(OUT_DIR);
await fse.ensureDir(CACHE_DIR);

// --- CONFIG ---
const TOP_TEAMS = 50;            // ✅ top 50 HLTV
const DELAY_MS = 1800;            // anti CF
const PLAYER_DETAIL_LIMIT = 1000;  // combien de profils HLTV.getPlayer on charge (lourd)
const QUESTIONS_TARGET = 8000;    // stop quand tu as assez
const MIN_HISTORY_TEAMS = 3;      // minimum d’équipes dans la carrière pour whoami career
const WHOAMI_TEAMS_CLUES = [3,4,5]; // nombre d’équipes montrées
const WHOAMI_TEAMMATES_CLUES = [3,4]; // nombre de teammates montrés
const HARD_WEIGHT = 0.75;         // % de questions "hard" dans le mix

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const pickN = (arr, n) => shuffle(arr).slice(0, n);

function normalize(str) {
  return (str || "").replace(/\s+/g, " ").trim();
}

function playerName(p) {
  return normalize(p?.name || p?.nickname || p?.ign || p?.title || "");
}

function safeCountry(player) {
  if (!player) return null;
  if (typeof player.country === "string") return player.country;
  if (player.country?.name) return player.country.name;
  return null;
}

async function cachedJSON(cacheKey, fetcher) {
  const file = path.join(CACHE_DIR, `${cacheKey}.json`);
  if (fs.existsSync(file)) return JSON.parse(await fse.readFile(file, "utf-8"));
  const data = await fetcher();
  await fse.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
  return data;
}

function formatQuestion(id, questionText, correctAnswer, wrongAnswers, meta = {}) {
  const choices = shuffle([correctAnswer, ...wrongAnswers].map(normalize));
  return {
    id,
    question: questionText,
    choices,
    answerIndex: choices.indexOf(normalize(correctAnswer)),
    meta,
    difficulty: "hard"
  };
}

function easyQuestion(id, questionText, correctAnswer, wrongAnswers, meta = {}) {
  const q = formatQuestion(id, questionText, correctAnswer, wrongAnswers, meta);
  q.difficulty = "easy";
  return q;
}

// ---------- HELPERS (career parsing) ----------
function extractTeamsFromPlayer(playerDetails) {
  // La structure varie selon la lib / HLTV. On essaye plusieurs patterns.
  // L’idée: récupérer une liste de noms d’équipes dans sa carrière.
  const teams = new Set();

  // 1) playerDetails.teams (souvent current/past)
  if (Array.isArray(playerDetails?.teams)) {
    for (const t of playerDetails.teams) {
      const n = normalize(t?.name || t?.team?.name || t);
      if (n) teams.add(n);
    }
  }

  // 2) playerDetails.history / playerDetails.teamHistory
  const hist = playerDetails?.history || playerDetails?.teamHistory || playerDetails?.teamsHistory;
  if (Array.isArray(hist)) {
    for (const h of hist) {
      const n = normalize(h?.team?.name || h?.name || h?.teamName);
      if (n) teams.add(n);
    }
  }

  // 3) fallback: currentTeam
  const ct = normalize(playerDetails?.team?.name || playerDetails?.currentTeam?.name);
  if (ct) teams.add(ct);

  return [...teams].filter(Boolean);
}

function buildTeammatesIndex(teamDataList) {
  // Pour chaque joueur, liste des coéquipiers (basé sur rosters top100)
  const mates = new Map(); // playerName -> Set(mateName)

  for (const team of teamDataList) {
    const roster = team?.players || team?.roster || [];
    const names = roster.map(playerName).filter(Boolean);
    for (const pName of names) {
      if (!mates.has(pName)) mates.set(pName, new Set());
      for (const other of names) {
        if (other !== pName) mates.get(pName).add(other);
      }
    }
  }

  return mates;
}

// ---------- GENERATORS ----------
function genWhoAmI_Career(playerDetails, globalPlayerNames) {
  const name = normalize(playerDetails?.name || playerDetails?.nickname);
  if (!name) return null;

  const teams = extractTeamsFromPlayer(playerDetails);
  if (teams.length < MIN_HISTORY_TEAMS) return null;

  const cluesCount = WHOAMI_TEAMS_CLUES[Math.floor(Math.random() * WHOAMI_TEAMS_CLUES.length)];
  const clues = pickN(teams, Math.min(cluesCount, teams.length));

  const distractors = pickN(globalPlayerNames.filter(p => p !== name), 3);
  if (distractors.length < 3) return null;

  return formatQuestion(
    `whoami:career:${name}:${clues.join("|")}`,
    `Qui suis-je ? (Teams: ${clues.join(" → ")})`,
    name,
    distractors,
    { type: "whoami_career", clues }
  );
}

function genWhoAmI_Teammates(playerNameStr, matesIndex, globalPlayerNames) {
  const mates = matesIndex.get(playerNameStr);
  if (!mates || mates.size < 3) return null;

  const matesArr = [...mates];
  const cluesCount = WHOAMI_TEAMMATES_CLUES[Math.floor(Math.random() * WHOAMI_TEAMMATES_CLUES.length)];
  const clues = pickN(matesArr, Math.min(cluesCount, matesArr.length));

  const distractors = pickN(globalPlayerNames.filter(p => p !== playerNameStr), 3);
  if (distractors.length < 3) return null;

  return formatQuestion(
    `whoami:mates:${playerNameStr}:${clues.join("|")}`,
    `Qui suis-je ? (J’ai joué avec: ${clues.join(", ")})`,
    playerNameStr,
    distractors,
    { type: "whoami_teammates", clues }
  );
}

function genWhoAmI_Mix(playerDetails, matesIndex, globalPlayerNames) {
  const name = normalize(playerDetails?.name || playerDetails?.nickname);
  if (!name) return null;

  const teams = extractTeamsFromPlayer(playerDetails);
  const mates = matesIndex.get(name);

  if (!teams?.length || !mates || mates.size < 2) return null;

  const teamClues = pickN(teams, Math.min(2, teams.length));
  const mateClues = pickN([...mates], 2);

  const distractors = pickN(globalPlayerNames.filter(p => p !== name), 3);
  if (distractors.length < 3) return null;

  return formatQuestion(
    `whoami:mix:${name}:${teamClues.join("|")}:${mateClues.join("|")}`,
    `Qui suis-je ? (Teams: ${teamClues.join(" → ")} | Teammates: ${mateClues.join(", ")})`,
    name,
    distractors,
    { type: "whoami_mix", teamClues, mateClues }
  );
}

// Une question "easy" pour remplir si besoin
function genEasy_Country(player, globalTeamNames) {
  const name = playerName(player);
  const country = safeCountry(player);
  if (!name || !country) return null;

  // Distracteurs pays simples
  const COMMON_COUNTRIES = [
    "Sweden","Russia","Ukraine","France","Denmark",
    "USA","Brazil","Poland","Germany","Finland",
    "Canada","Australia","China","United Kingdom","Norway"
  ];
  const wrong = pickN(COMMON_COUNTRIES.filter(c => c !== country), 3);
  if (wrong.length < 3) return null;

  return easyQuestion(
    `easy:country:${name}`,
    `De quel pays vient ${name} ?`,
    country,
    wrong,
    { type: "country" }
  );
}

async function main() {
  console.log("Fetching team ranking...");
  const ranking = await cachedJSON("teamRanking_latest", async () => {
    await sleep(DELAY_MS);
    return HLTV.getTeamRanking();
  });

  const top = ranking.slice(0, TOP_TEAMS);
  console.log(`Top teams loaded: ${top.length}`);

  // Les structures de getTeamRanking varient: parfois t.team.name/id
  const rankingTeams = top.map(t => {
    const team = t.team || t; // selon la lib
    return { id: team.id, name: team.name };
  }).filter(t => t.id && t.name);

  const allTeamNames = rankingTeams.map(t => t.name);

  // Fetch teams + rosters
  const teamDataList = [];
  const playerPool = []; // { id, name, country?, teamName? }
  const playerSeen = new Set();

  for (let i = 0; i < rankingTeams.length; i++) {
    const { id: teamId, name: teamName } = rankingTeams[i];
    console.log(`[${i + 1}/${rankingTeams.length}] Fetch team ${teamName} (${teamId})`);

    const team = await cachedJSON(`team_${teamId}`, async () => {
      await sleep(DELAY_MS);
      return HLTV.getTeam({ id: teamId });
    });

    if (!team) continue;
    teamDataList.push(team);

    const roster = team.players || team.roster || [];
    for (const p of roster) {
      const n = playerName(p);
      const pid = p?.id;
      if (!n) continue;
      if (!playerSeen.has(n)) {
        playerSeen.add(n);
        playerPool.push({ id: pid, name: n, country: safeCountry(p), teamName });
      }
    }
  }

  const globalPlayerNames = shuffle(playerPool.map(p => p.name));
  const matesIndex = buildTeammatesIndex(teamDataList);

  console.log(`Player pool (unique): ${playerPool.length}`);

  // Pré-fetch player details (limited)
  const detailedPlayers = [];
  const detailCandidates = shuffle(playerPool.filter(p => p.id)); // besoin de l’id HLTV

  for (let i = 0; i < Math.min(PLAYER_DETAIL_LIMIT, detailCandidates.length); i++) {
    const p = detailCandidates[i];
    console.log(`[player ${i + 1}/${Math.min(PLAYER_DETAIL_LIMIT, detailCandidates.length)}] getPlayer ${p.name} (${p.id})`);

    const details = await cachedJSON(`player_${p.id}`, async () => {
      await sleep(DELAY_MS);
      return HLTV.getPlayer({ id: p.id });
    });

    if (details) detailedPlayers.push(details);
  }

  console.log(`Detailed players loaded: ${detailedPlayers.length}`);

  // Generate questions
  const seen = new Set();
  const allQuestions = [];

  function pushQ(q) {
    if (!q) return;
    if (seen.has(q.id)) return;
    seen.add(q.id);
    allQuestions.push(q);
  }

  // HARD: career + teammates + mix
  while (allQuestions.length < QUESTIONS_TARGET) {
    const roll = Math.random();
    const hard = Math.random() < HARD_WEIGHT;

    if (hard && detailedPlayers.length) {
      const d = detailedPlayers[Math.floor(Math.random() * detailedPlayers.length)];

      if (roll < 0.45) pushQ(genWhoAmI_Career(d, globalPlayerNames));
      else if (roll < 0.75) {
        const name = normalize(d?.name || d?.nickname);
        pushQ(genWhoAmI_Teammates(name, matesIndex, globalPlayerNames));
      } else pushQ(genWhoAmI_Mix(d, matesIndex, globalPlayerNames));

    } else {
      // EASY filler (si tu veux quand même un peu de easy)
      const p = playerPool[Math.floor(Math.random() * playerPool.length)];
      pushQ(genEasy_Country(p, allTeamNames));
    }

    // safety break si plus rien de nouveau
    if (seen.size > 200000) break;
    if (allQuestions.length >= QUESTIONS_TARGET) break;
  }

  const outJson = path.join(OUT_DIR, "questions_hltv.json");
  await fse.writeFile(outJson, JSON.stringify(shuffle(allQuestions), null, 2), "utf-8");

  console.log(`✅ Generated: ${allQuestions.length} questions`);
  console.log(`➡️ ${outJson}`);
  console.log(`ℹ️ Player details cached in ${CACHE_DIR}/player_*.json`);
}

main().catch((e) => {
  console.error("ERROR:", e);
  process.exit(1);
});