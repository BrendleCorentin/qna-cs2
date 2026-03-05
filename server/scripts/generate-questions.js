import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTeamRoster, TOP_TEAMS } from '../src/utils/liquipediaScraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..'); // Points to server root

// Output file path
const OUT_FILE = path.join(projectRoot, 'src', 'config', 'questions_generated.json');

// Helper to shuffle array
function shuffle(array) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

async function generate() {
  console.log('Starting question generation from Liquipedia...');
  console.log(`Targeting ${TOP_TEAMS.length} top teams.`);

  const allPlayers = [];
  const teamRosters = {};

  // 1. Fetch all rosters
  for (const teamName of TOP_TEAMS) {
    try {
      console.log(`Fetching roster for ${teamName}...`);
      const roster = await getTeamRoster(teamName);
      
      if (roster && roster.length > 0) {
        teamRosters[teamName] = roster;
        allPlayers.push(...roster);
        console.log(`  -> Found ${roster.length} members.`);
      } else {
        console.warn(`  -> Skipping ${teamName} (empty roster or fetch failed)`);
      }
      
      // Be nice to the API
      await new Promise(r => setTimeout(r, 1500));
    } catch (err) {
      console.error(`Error processing ${teamName}:`, err.message);
    }
  }

  console.log(`Collected ${allPlayers.length} total players/coaches from ${Object.keys(teamRosters).length} teams.`);
  
  const questions = [];

  // 2. Generate Questions
  
  // Type A: "Which team does [Player] play for?"
  for (const player of allPlayers) {
    if (player.role === 'Coach') continue; 

    // Find correct team
    const correctTeam = player.team;
    
    // Get 3 random OTHER teams from our list
    const otherTeams = TOP_TEAMS
      .map(t => t.replace(/_/g, ' '))
      .filter(t => t !== correctTeam);
      
    if (otherTeams.length < 3) continue;

    const distractors = shuffle(otherTeams).slice(0, 3);
    const choicesRaw = shuffle([correctTeam, ...distractors]);
    
    questions.push({
      id: generateId(),
      question: `For which team does ${player.ign} play?`,
      choices: choicesRaw,
      answerIndex: choicesRaw.indexOf(correctTeam)
    });
  }

  // Type B: "Who is the coach of [Team]?"
  for (const [teamName, roster] of Object.entries(teamRosters)) {
    const coach = roster.find(p => p.role === 'Coach');
    if (!coach) continue;

    const teamDisplay = teamName.replace(/_/g, ' ');
    
    // Distractors: other coaches or random players
    const otherCoaches = allPlayers
        .filter(p => p.role === 'Coach' && p.team !== teamDisplay)
        .map(p => p.ign);
    
    // Fill with players if needed
    const distractorPool = [...otherCoaches, ...allPlayers.filter(p => p.role !== 'Coach').map(p => p.ign)];
    let distractors = shuffle(distractorPool.filter(n => n !== coach.ign)).slice(0, 3);
    
    if (distractors.length < 3) continue;

    const choicesRaw = shuffle([coach.ign, ...distractors]);

    questions.push({
      id: generateId(),
      question: `Who is the coach of ${teamDisplay}?`,
      choices: choicesRaw,
      answerIndex: choicesRaw.indexOf(coach.ign)
    });
  }

  // Type C: "Which player is NOT part of [Team]?"
  for (const [teamName, roster] of Object.entries(teamRosters)) {
      const activePlayers = roster.filter(p => p.role === 'Player');
      if (activePlayers.length < 3) continue;

      const teamDisplay = teamName.replace(/_/g, ' ');

      // Pick 3 correct players
      const correctSubset = shuffle(activePlayers).slice(0, 3);
      
      // Pick 1 impostor (player from another team)
      const otherPlayers = allPlayers.filter(p => p.team !== teamDisplay && p.role === 'Player');
      if (otherPlayers.length === 0) continue;
      
      const impostor = shuffle(otherPlayers)[0];

      // Format choices: 3 correct + 1 impostor
      const choicesRaw = shuffle([...correctSubset.map(p => p.ign), impostor.ign]);
      const answerIndex = choicesRaw.indexOf(impostor.ign);
      
      questions.push({
          id: generateId(),
          question: `Which player is NOT part of ${teamDisplay}?`,
          choices: choicesRaw,
          answerIndex
      });
  }

  // Type D: Nationality
   for (const player of allPlayers) {
    if (!player.country || player.country === 'Unknown') continue;

    const correctCountry = player.country;
    
    // Distractors
    const standardCountries = ['France', 'Denmark', 'Russia', 'Ukraine', 'Brazil', 'USA', 'Sweden', 'Poland', 'Germany', 'China'];
    let otherCountries = standardCountries.filter(c => c !== correctCountry);
    const distractors = shuffle(otherCountries).slice(0, 3);

    const choicesRaw = shuffle([correctCountry, ...distractors]);
    const answerIndex = choicesRaw.indexOf(correctCountry);

    questions.push({
      id: generateId(),
      question: `What is the nationality of ${player.ign}?`,
      choices: choicesRaw,
      answerIndex
    });
  }


  console.log(`Generated ${questions.length} questions.`);

  // Only write if we actually generated questions to avoid wiping the DB if scraper fails/is blocked
  if (questions.length === 0) {
      console.warn("WARNING: No questions generated. This likely means the Liquipedia scraper was blocked or failed.");
      console.warn("Aborting save to preserve existing questions file.");
      process.exit(1); 
  }

  // Also check if we have significantly fewer questions than expected (e.g. < 50)
  // But maybe for small tests we don't block. Let's just block 0.

  fs.writeFileSync(OUT_FILE, JSON.stringify(questions, null, 2));
  console.log(`Saved to ${OUT_FILE}`);
}

generate();
