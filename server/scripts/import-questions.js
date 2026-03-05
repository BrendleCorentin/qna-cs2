import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, addQuestion, getAllQuestions } from '../src/db/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const questionsFile = path.resolve(__dirname, '../src/config/questions_generated.json');

async function importQuestions() {
  if (!fs.existsSync(questionsFile)) {
    console.error(`Error: File not found: ${questionsFile}`);
    console.error("Run 'npm run generate:questions' first.");
    process.exit(1);
  }

  const rawData = fs.readFileSync(questionsFile, 'utf-8');
  const questions = JSON.parse(rawData);
  
  console.log(`[Import] Found ${questions.length} generated questions.`);
  
  // Get existing questions to avoid duplicates
  const existingQuestions = await getAllQuestions();
  const existingSet = new Set(existingQuestions.map(q => q.question));

  let importedCount = 0;
  let skippedCount = 0;

  console.log(`[Import] Checking against ${existingQuestions.length} existing questions...`);

  for (const q of questions) {
    if (existingSet.has(q.question)) {
      skippedCount++;
      continue;
    }

    try {
      // Map HLTV question format to DB format
      await addQuestion({
        type: 'mcq',
        question: q.question,
        choices: q.choices,
        answerIndex: q.answerIndex,
        answer: q.choices[q.answerIndex] // Redundant but good for checking
      });
      importedCount++;
      //console.log(`imported: ${q.question.substring(0, 50)}...`);
    } catch (e) {
      console.error(`Failed to import question: ${q.question}`, e);
    }
  }

  console.log(`✅ Import finished.`);
  console.log(`   Imported: ${importedCount}`);
  console.log(`   Skipped (duplicates): ${skippedCount}`);
  
  // Close the database connection gracefully if possible, 
  // though typically script termination handles file locks.
  // Assuming SQLite closes automatically on process exit.
}

importQuestions().catch(console.error);
