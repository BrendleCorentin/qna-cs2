import fs from "fs";
import fse from "fs-extra";
import path from "path";
import { HLTV } from "hltv";

const OUT_DIR = path.resolve("./src/config");
const CACHE_DIR = path.resolve("./cache");

await fse.ensureDir(OUT_DIR);
await fse.ensureDir(CACHE_DIR);

// --- CONFIG ---
const TOP_TEAMS = 20;          // Reduce requests for testing, increase if needed
const DELAY_MS = 2000;         // safe delay for HLTV
const MAX_Q_PER_PLAYER = 2;    // Limit per player to avoid spam

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pickN = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function normalize(str) {
  return (str || "")
    .replace(/\s+/g, " ")
    .trim();
}

// Simple JSON file cache
async function cachedJSON(cacheKey, fetcher) {
  const file = path.join(CACHE_DIR, `${cacheKey}.json`);
  if (fs.existsSync(file)) {
    return JSON.parse(await fse.readFile(file, "utf-8"));
  }
  const data = await fetcher();
  await fse.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
  return data;
}

// Helper to format question for the game
function formatQuestion(id, questionText, correctAnswer, wrongAnswers) {
  const choices = shuffle([correctAnswer, ...wrongAnswers]);
  return {
    id,
    question: questionText,
    choices,
    answerIndex: choices.indexOf(correctAnswer),
  };
}

function safeCountry(player) {
  if (!player) return null;
  if (typeof player.country === "string") return player.country;
  if (player.country?.name) return player.country.name;
  return null;
}

function playerName(p) {
  return normalize(p?.name || p?.nickname || p?.ign || p?.title || "");
}

// Common CS countries for distractors
const COMMON_COUNTRIES = [
    "Sweden", "Russia", "Ukraine", "France", "Denmark", 
    "USA", "Brazil", "Poland", "Germany", "Finland", 
    "Canada", "Australia", "China", "United Kingdom", "Norway"
];

function getRandomCountries(exclude, count) {
    const pool = COMMON_COUNTRIES.filter(c => c !== exclude);
    return pickN(pool, count);
}

// Global data for distractors
let allPlayerNames = [];
let allTeamNames = [];

// Generate questions for a player
function generateForPlayer(player, team) {
  const questions = [];
  const name = playerName(player);
  const country = safeCountry(player);

  if (!name) return questions;

  // 1) Country Question
  if (country) {
    const distractors = getRandomCountries(country, 3);
    if (distractors.length === 3) {
        questions.push(
            formatQuestion(
                `country:${name}`,
                `De quel pays vient ${name} ?`,
                country,
                distractors
            )
        );
    }
  }

  // 2) Current Team Question
  if (team?.name) {
    const distractors = pickN(allTeamNames.filter(t => t !== team.name), 3);
    if (distractors.length === 3) {
        questions.push(
            formatQuestion(
                `team:${name}:${team.name}`,
                `${name} joue dans quelle équipe ?`,
                team.name,
                distractors
            )
        );
    }
  }

  // 3) "Who am I?"
  if (country && team?.name) {
    const distractors = pickN(allPlayerNames.filter(p => p !== name), 3);
    if (distractors.length === 3) {
        questions.push(
            formatQuestion(
                `who:${name}:${team.name}:${country}`,
                `Qui suis-je ? (Pays: ${country}, Équipe: ${team.name})`,
                name,
                distractors
            )
        );
    }
  }

  return questions.slice(0, MAX_Q_PER_PLAYER);
}

// Roster MCQ
function generateRosterMCQ(team, roster) {
  const questions = [];
  if (!team?.name || !Array.isArray(roster) || roster.length < 4) return questions;

  const correct = roster[Math.floor(Math.random() * roster.length)];
  const correctName = playerName(correct);
  if (!correctName) return questions;

  // Distractors from other teams (to make it harder/clearer) rather than same team? 
  // User's original script picked from SAME team? "Lequel de ces joueurs fait partie de TEAM?" 
  // The original logic: options = pickN(roster..., 3). 
  // Wait, if I pick 3 players from the SAME roster, they are ALL correct answers for "Who is in Team X?".
  // The question is "Lequel de ces joueurs fait partie de [Team] ?". 
  // So the distractors must be players NOT in the team.
  
  // The original logic was:
  // options = pickN(roster.filter(p => ... !== correctName), 3)
  // And question was "Lequel de ces joueurs fait partie de Team?"
  // If options come from roster, then ALL options are correct. That's a bad MCQ. 
  // It should be: Pick 1 correct from roster, pick 3 distractors from OTHER teams.

  const distractors = pickN(allPlayerNames.filter(p => !roster.some(rp => playerName(rp) === p)), 3);

  if (distractors.length === 3) {
      questions.push(
        formatQuestion(
            `mcq:roster:${team.name}:${correctName}`,
            `Lequel de ces joueurs fait partie de l'équipe ${team.name} ?`,
            correctName,
            distractors
        )
      );
  }

  return questions;
}

async function main() {
  console.log("Fetching team ranking...");
  const ranking = await cachedJSON("teamRanking_latest", async () => {
    try {
        const res = await HLTV.getTeamRanking();
        return res;
    } catch (e) {
        console.error("HLTV fetch failed", e);
        return [];
    }
  });

  const top = ranking.slice(0, TOP_TEAMS);
  console.log(`Top teams loaded: ${top.length}`);
  
  allTeamNames = top.map(t => t.team.name);

  // Pre-fetch all teams to build player pool for distractors
  const teamDataList = [];
  
  for (let i = 0; i < top.length; i++) {
    const t = top[i];
    const teamId = t.team.id;
    const teamName = t.team.name;
    
    console.log(`[${i + 1}/${top.length}] Fetching Team: ${teamName} (${teamId})`);
    
    const team = await cachedJSON(`team_${teamId}`, async () => {
        await sleep(DELAY_MS);
        try {
            return await HLTV.getTeam({ id: teamId });
        } catch (e) {
            console.error(`Failed to fetch team ${teamId}`, e);
            return null;
        }
    });

    if (team) {
        teamDataList.push(team);
        const roster = team.players || team.roster || [];
        roster.forEach(p => {
             const name = playerName(p);
             if (name) allPlayerNames.push(name);
        });
    }
  }

  const allQuestions = [];
  const seen = new Set();

  for (const team of teamDataList) {
    const roster = team.players || team.roster || [];
    if (!Array.isArray(roster) || roster.length === 0) continue;

    // Roster questions
    for (const qst of generateRosterMCQ(team, roster)) {
       if (!seen.has(qst.id)) {
           seen.add(qst.id);
           allQuestions.push(qst);
       }
    }

    // Player questions
    for (const p of roster) {
        const qs = generateForPlayer(p, team);
        for (const qst of qs) {
            if (!seen.has(qst.id)) {
                seen.add(qst.id);
                allQuestions.push(qst);
            }
        }
    }
  }

  const shuffled = shuffle(allQuestions);
  const outJson = path.join(OUT_DIR, "questions_hltv.json");

  await fse.writeFile(outJson, JSON.stringify(shuffled, null, 2), "utf-8");

  console.log(`✅ Generated: ${shuffled.length} questions`);
  console.log(`➡️ ${outJson}`);
}

main().catch((e) => {
  console.error("ERROR:", e);
  process.exit(1);
});
