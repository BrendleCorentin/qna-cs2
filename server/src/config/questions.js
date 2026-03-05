import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const manualQuestions = [
  {
    id: "cs1",
    question: "Quel est le prix de l'AWP dans CS2 ?",
    choices: ["4750$", "5000$", "4500$", "2700$"],
    answerIndex: 0,
  },
  {
    id: "cs2",
    question: "Sur quelle carte trouve-t-on la zone 'Banana' ?",
    choices: ["Mirage", "Inferno", "Nuke", "Overpass"],
    answerIndex: 1,
  },
  {
    id: "cs3",
    question: "Combien de rounds faut-il remporter pour gagner un match compétitif (MR12) ?",
    choices: ["16", "13", "15", "12"],
    answerIndex: 1,
  },
  {
    id: "cs4",
    question: "Quel est le prix d'un Kit de désamorçage CT ?",
    choices: ["200$", "400$", "600$", "Free"],
    answerIndex: 1,
  },
  {
    id: "cs5",
    question: "Quelle arme est considérée comme l'équivalent terroriste de la M4A4/M4A1-S ?",
    choices: ["Galil AR", "SG 553", "AK-47", "G3SG1"],
    answerIndex: 2,
  },
];

let generatedQuestions = [];
try {
  const filePath = path.join(__dirname, "questions_hltv.json");
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf-8");
    generatedQuestions = JSON.parse(data);
    console.log(`[Config] Loaded ${generatedQuestions.length} generated questions.`);
  }
} catch (e) {
  console.error("Failed to load generated questions:", e);
}

export const QUESTIONS = [...manualQuestions, ...generatedQuestions];
