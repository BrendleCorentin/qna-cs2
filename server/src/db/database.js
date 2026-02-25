import sqlite3Description from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

// Use default import if sqlite3 exports default, otherwise fallback
const sqlite3 = sqlite3Description.verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Assure que le dossier existe
const dbDir = path.resolve(__dirname);
if (!fs.existsSync(dbDir)){
    try {
        fs.mkdirSync(dbDir, { recursive: true });
    } catch(e) {
        console.warn("Could not create db directory:", e.message);
    }
}

const dbPath = path.join(__dirname, 'game.db');
console.log("Database path:", dbPath);

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur lors de la connexion à la base de données SQLite:', err.message);
  } else {
    console.log('Connecté à la base de données SQLite.');
    initDB();
  }
});

function initDB() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id TEXT,
        player1 TEXT,
        player2 TEXT,
        score1 INTEGER,
        score2 INTEGER,
        winner TEXT,
        reason TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error("Erreur lors de la création de la table matches:", err.message);
      } else {
        console.log("Table 'matches' prête.");
      }
    });

    // Optionnel: Créer un index sur match_id
    db.run(`CREATE INDEX IF NOT EXISTS idx_match_id ON matches(match_id)`);

    // Table Users
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password_hash TEXT,
        elo INTEGER DEFAULT 1000,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
        if (err) console.error("Erreur table users:", err.message);
        else console.log("Table 'users' prête.");
    });
  });
}

export function getUserByUsername(username) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

export async function registerUser(username, password) {
    console.log(`[DB] Registering user: ${username}`);
    const existing = await getUserByUsername(username);
    if (existing) {
        console.log(`[DB] User ${username} already exists`);
        throw new Error("Pseudo déjà pris");
    }

    console.log(`[DB] Hashing password for ${username}`);
    const hash = await bcrypt.hash(password, 10);
    
    return new Promise((resolve, reject) => {
        console.log(`[DB] Inserting user into DB`);
        // Use simpler callback to debug potential 'this' issues or callback signature issues
        db.run("INSERT INTO users (username, password_hash) VALUES (?, ?)", [username, hash], function(err) {
            if (err) {
                console.error(`[DB] Insert error: ${err.message}`);
                reject(err);
            }
            else {
                // 'this.lastID' should work with function(err) but let's be safe and just return username
                const id = this ? this.lastID : 0; 
                console.log(`[DB] User inserted with ID ${id}`);
                resolve({ id, username, elo: 1000 });
            }
        });
    });
}

export async function loginUser(username, password) {
    console.log(`[DB] Logging in user: ${username}`);
    const user = await getUserByUsername(username);
    if (!user) {
        console.log(`[DB] User ${username} not found`);
        throw new Error("Utilisateur inconnu");
    }

    console.log(`[DB] Verifying password for ${username}`);
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
        console.log(`[DB] Password mismatch for ${username}`);
        throw new Error("Mot de passe incorrect");
    }

    console.log(`[DB] Login successful for ${username}`);
    return { id: user.id, username: user.username, elo: user.elo };
}

export function updateUserElo(username, newElo) {
    return new Promise((resolve, reject) => {
        db.run("UPDATE users SET elo = ? WHERE username = ?", [newElo, username], function(err) {
            if (err) reject(err);
            else resolve();
        });
    });
}

export function getLeaderboard(limit = 50) {
    return new Promise((resolve, reject) => {
        db.all("SELECT username, elo FROM users ORDER BY elo DESC LIMIT ?", [limit], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}


export function logMatchResult(matchData) {
  const { matchId, player1, player2, score1, score2, winner, reason } = matchData;
  const sql = `INSERT INTO matches (match_id, player1, player2, score1, score2, winner, reason) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [matchId, player1, player2, score1, score2, winner, reason], function(err) {
    if (err) {
      return console.error("Erreur lors de l'insertion du match:", err.message);
    }
    console.log(`Match ${matchId} enregistré avec l'ID ${this.lastID}`);
  });
}
