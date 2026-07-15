import sqlite3Description from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import { QUESTIONS_DB_SEED } from '../config/questions_db.js';

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
    db.run("PRAGMA foreign_keys = ON");
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

    // Table Questions (Nouvelle version avec support TEXT et MCQ)
    db.run(`
      CREATE TABLE IF NOT EXISTS questions_v2 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT DEFAULT 'mcq',
        category TEXT DEFAULT 'qcm',
        question TEXT NOT NULL,
        choices TEXT,
        answerIndex INTEGER,
        answer TEXT
      )
    `, (err) => {
        if (err) console.error("Erreur table questions_v2:", err.message);
        else console.log("Table 'questions_v2' prête.");
    });

    db.all("PRAGMA table_info(questions_v2)", [], (err, columns) => {
      if (err) return console.error("Erreur lecture structure questions_v2:", err.message);
      const classifyExistingQuestions = () => db.run(
        `UPDATE questions_v2
         SET category = CASE
           WHEN UPPER(question) LIKE 'QUI SUIS-JE%' THEN 'who_am_i'
           WHEN type = 'mcq' THEN 'qcm'
           WHEN type = 'progressive_clue' THEN 'progressive'
           ELSE 'open'
         END
         WHERE category IS NULL OR category = ''`,
        (classifyErr) => {
          if (classifyErr) console.error("Erreur classement questions:", classifyErr.message);
          else seedQuestions();
        }
      );

      if (!columns.some((column) => column.name === "category")) {
        db.run("ALTER TABLE questions_v2 ADD COLUMN category TEXT", (alterErr) => {
          if (alterErr) console.error("Erreur ajout category:", alterErr.message);
          else classifyExistingQuestions();
        });
      } else {
        classifyExistingQuestions();
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
        avatar_seed TEXT,
        favorite_team TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
        if (err) console.error("Erreur table users:", err.message);
        else console.log("Table 'users' prête.");
    });

    db.all("PRAGMA table_info(users)", [], (err, columns) => {
      if (err) return console.error("Erreur lecture structure users:", err.message);
      if (!columns.some((column) => column.name === "avatar_seed")) {
        db.run("ALTER TABLE users ADD COLUMN avatar_seed TEXT");
      }
      if (!columns.some((column) => column.name === "favorite_team")) {
        db.run("ALTER TABLE users ADD COLUMN favorite_team TEXT");
      }
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS friendships (
        user1_id INTEGER NOT NULL,
        user2_id INTEGER NOT NULL,
        requested_by INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user1_id, user2_id),
        FOREIGN KEY(user1_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(user2_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
        if (err) console.error("Erreur table sessions:", err.message);
        else console.log("Table 'sessions' prête.");
    });
    db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`);
  });
}

export function getUserByUsername(username) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE username = ? COLLATE NOCASE", [username], (err, row) => {
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
                resolve({ id, username, elo: 1000, avatarSeed: username, favoriteTeam: "" });
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
    return { id: user.id, username: user.username, elo: user.elo, avatarSeed: user.avatar_seed || user.username, favoriteTeam: user.favorite_team || "" };
}

const hashSessionToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export function createUserSession(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashSessionToken(token);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    return new Promise((resolve, reject) => {
        db.run("DELETE FROM sessions WHERE expires_at <= datetime('now')");
        db.run(
            "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
            [tokenHash, userId, expiresAt],
            (err) => err ? reject(err) : resolve(token)
        );
    });
}

export function getUserBySession(token) {
    if (!token || typeof token !== 'string') return Promise.resolve(null);
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT users.id, users.username, users.elo, COALESCE(users.avatar_seed, users.username) AS avatarSeed,
                   COALESCE(users.favorite_team, '') AS favoriteTeam
            FROM sessions
            JOIN users ON users.id = sessions.user_id
            WHERE sessions.token_hash = ? AND sessions.expires_at > datetime('now')
        `, [hashSessionToken(token)], (err, row) => {
            if (err) reject(err);
            else resolve(row || null);
        });
    });
}

export function deleteUserSession(token) {
    if (!token || typeof token !== 'string') return Promise.resolve();
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM sessions WHERE token_hash = ?", [hashSessionToken(token)], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

export function updateUserProfile(userId, username, avatarSeed, favoriteTeam) {
    const cleanUsername = String(username || "").trim();
    const cleanAvatarSeed = String(avatarSeed || cleanUsername).trim().slice(0, 40);
    const allowedTeams = ['', 'Vitality', 'NAVI', 'G2', 'Spirit', 'FURIA', 'FaZe', 'Liquid', 'MOUZ', 'Astralis', 'Falcons', 'The MongolZ', 'NIP'];
    const cleanFavoriteTeam = allowedTeams.includes(favoriteTeam) ? favoriteTeam : '';
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(cleanUsername)) {
        return Promise.reject(new Error("Le pseudo doit contenir 3 à 20 caractères : lettres, chiffres, _ ou -"));
    }
    return new Promise((resolve, reject) => {
        db.run("UPDATE users SET username = ?, avatar_seed = ?, favorite_team = ? WHERE id = ?", [cleanUsername, cleanAvatarSeed, cleanFavoriteTeam, userId], function(err) {
            if (err?.code === "SQLITE_CONSTRAINT") reject(new Error("Ce pseudo est déjà utilisé"));
            else if (err) reject(err);
            else if (!this.changes) reject(new Error("Utilisateur introuvable"));
            else db.get("SELECT id, username, elo, COALESCE(avatar_seed, username) AS avatarSeed, COALESCE(favorite_team, '') AS favoriteTeam FROM users WHERE id = ?", [userId], (getErr, row) => getErr ? reject(getErr) : resolve(row));
        });
    });
}

export function sendFriendRequest(userId, targetUsername) {
    return new Promise((resolve, reject) => {
        db.get("SELECT id FROM users WHERE username = ? COLLATE NOCASE", [String(targetUsername || "").trim()], (err, target) => {
            if (err) return reject(err);
            if (!target) return reject(new Error("Joueur introuvable"));
            if (target.id === userId) return reject(new Error("Tu ne peux pas t'ajouter toi-même"));
            const user1 = Math.min(userId, target.id);
            const user2 = Math.max(userId, target.id);
            db.run("INSERT INTO friendships (user1_id, user2_id, requested_by) VALUES (?, ?, ?)", [user1, user2, userId], (insertErr) => {
                if (insertErr?.code === "SQLITE_CONSTRAINT") reject(new Error("Une relation ou demande existe déjà"));
                else if (insertErr) reject(insertErr);
                else resolve();
            });
        });
    });
}

export function acceptFriendRequest(userId, requesterId) {
    const user1 = Math.min(userId, requesterId);
    const user2 = Math.max(userId, requesterId);
    return new Promise((resolve, reject) => {
        db.run("UPDATE friendships SET status = 'accepted' WHERE user1_id = ? AND user2_id = ? AND requested_by = ? AND status = 'pending'", [user1, user2, requesterId], function(err) {
            if (err) reject(err);
            else if (!this.changes) reject(new Error("Demande introuvable"));
            else resolve();
        });
    });
}

export function removeFriendship(userId, otherUserId) {
    const user1 = Math.min(userId, otherUserId);
    const user2 = Math.max(userId, otherUserId);
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM friendships WHERE user1_id = ? AND user2_id = ?", [user1, user2], (err) => err ? reject(err) : resolve());
    });
}

export function getFriendOverview(userId) {
    return new Promise((resolve, reject) => {
        db.all(`
          SELECT u.id, u.username, COALESCE(u.avatar_seed, u.username) AS avatarSeed,
                 COALESCE(u.favorite_team, '') AS favoriteTeam,
                 f.status, f.requested_by AS requestedBy
          FROM friendships f
          JOIN users u ON u.id = CASE WHEN f.user1_id = ? THEN f.user2_id ELSE f.user1_id END
          WHERE f.user1_id = ? OR f.user2_id = ?
          ORDER BY u.username COLLATE NOCASE
        `, [userId, userId, userId], (err, rows) => err ? reject(err) : resolve(rows));
    });
}

export function updateUserElo(username, newElo) {
    return new Promise((resolve, reject) => {
        db.run("UPDATE users SET elo = ? WHERE username = ?", [newElo, username], function(err) {
            if (err) reject(err);
            else resolve();
        });
    });
}

export function updateUserEloById(id, newElo) {
    return new Promise((resolve, reject) => {
        db.run("UPDATE users SET elo = ? WHERE id = ?", [newElo, id], function(err) {
            if (err) reject(err);
            else resolve();
        });
    });
}

export function getLeaderboard(limit = 50) {
    return new Promise((resolve, reject) => {
        db.all("SELECT username, elo, COALESCE(avatar_seed, username) AS avatarSeed, COALESCE(favorite_team, '') AS favoriteTeam FROM users ORDER BY elo DESC LIMIT ?", [limit], (err, rows) => {
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

function seedQuestions() {
    console.log("[DB] Adding missing seed questions...");
    db.run("DELETE FROM questions_v2 WHERE type = 'text' AND UPPER(question) LIKE 'QUI SUIS-JE ?%'");
    db.run(`
      DELETE FROM questions_v2
      WHERE type = 'mcq'
        AND category IN ('lineup_completion', 'transfer_history', 'match_history', 'tournament_path')
    `);
    // Retire l'ancienne série ultra-difficile centrée sur l'actualité 2026.
    // Le filtre est volontairement ciblé pour ne pas toucher aux autres questions.
    db.run(`
      DELETE FROM questions_v2
      WHERE category IN ('lineup_completion', 'transfer_history', 'match_history', 'date_challenge', 'tournament_path')
        AND (question LIKE '%2026%' OR question LIKE '%Super DraculaN%')
    `);
    const stmt = db.prepare(`
        INSERT INTO questions_v2 (type, category, question, choices, answerIndex, answer)
        SELECT ?, ?, ?, ?, ?, ?
        WHERE NOT EXISTS (SELECT 1 FROM questions_v2 WHERE question = ?)
    `);

    QUESTIONS_DB_SEED.forEach(q => {
            const openAnswerCategories = ['lineup_completion', 'transfer_history', 'match_history', 'tournament_path'];
            const type = openAnswerCategories.includes(q.category) ? 'text' : (q.type || 'mcq');
            const category = q.category || (q.question.toUpperCase().startsWith('QUI SUIS-JE') ? 'who_am_i' : type === 'mcq' ? 'qcm' : type === 'progressive_clue' ? 'progressive' : 'open');
            let choices = null;
            if (q.choices) choices = JSON.stringify(q.choices);
            else if (q.clues && type === 'progressive_clue') choices = JSON.stringify(q.clues);

            const idx = type === 'mcq' && q.answerIndex !== undefined ? q.answerIndex : null;
            const ans = q.answer || (openAnswerCategories.includes(q.category) ? q.choices?.[q.answerIndex] : null);
            stmt.run(type, category, q.question, choices, idx, ans, q.question);
    });

    stmt.finalize();
    console.log(`[DB] Checked ${QUESTIONS_DB_SEED.length} seed questions.`);
}
    
export function forceSeedQuestions() {
  return new Promise((resolve, reject) => {
    console.log("[DB] Force seeding questions...");
    const stmt = db.prepare(`
      INSERT INTO questions_v2 (type, category, question, choices, answerIndex, answer)
      SELECT ?, ?, ?, ?, ?, ?
      WHERE NOT EXISTS (SELECT 1 FROM questions_v2 WHERE question = ?)
    `);

    let completed = 0;
    const total = QUESTIONS_DB_SEED.length;

    QUESTIONS_DB_SEED.forEach((q) => {
      const openAnswerCategories = ['lineup_completion', 'transfer_history', 'match_history', 'tournament_path'];
      const type = openAnswerCategories.includes(q.category) ? 'text' : (q.type || "mcq");
      const category = q.category || (q.question.toUpperCase().startsWith('QUI SUIS-JE') ? 'who_am_i' : type === 'mcq' ? 'qcm' : type === 'progressive_clue' ? 'progressive' : 'open');
      let choices = null;
      if (q.choices) choices = JSON.stringify(q.choices);
      else if (q.clues && type === 'progressive_clue') choices = JSON.stringify(q.clues);

      const idx = type === 'mcq' && q.answerIndex !== undefined ? q.answerIndex : null;
      const ans = q.answer || (openAnswerCategories.includes(q.category) ? q.choices?.[q.answerIndex] : null);
      
      stmt.run([type, category, q.question, choices, idx, ans, q.question], (err) => {
        if (err) console.error("Error inserting seed question:", err.message);
        completed++;
        if (completed === total) {
            stmt.finalize(() => {
                resolve({ count: total });
            });
        }
      });
    });
  });
}

export function getRandomQuestions(limit = 5) {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM questions_v2 ORDER BY RANDOM() LIMIT ?", [limit], (err, rows) => {
            if (err) reject(err);
            else {
                // Parse choices from JSON string if present
                const questions = rows.map(r => {
                    const parsed = r.choices ? JSON.parse(r.choices) : null;
                    return {
                        ...r,
                        id: r.id.toString(), // client expects string ID
                        choices: r.type === 'mcq' ? parsed : null,
                        clues: r.type === 'progressive_clue' ? parsed : null
                    };
                });
                resolve(questions);
            }
        });
    });
}

export function getAllQuestions() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM questions_v2 ORDER BY id DESC", [], (err, rows) => {
      if (err) reject(err);
      else {
        const questions = rows.map((r) => {
            const parsed = r.choices ? JSON.parse(r.choices) : null;
            return {
                ...r,
                id: r.id.toString(),
                choices: r.type === 'mcq' ? parsed : null,
                clues: r.type === 'progressive_clue' ? parsed : null,
            };
        });
        resolve(questions);
      }
    });
  });
}

export function addQuestion(q) {
  return new Promise((resolve, reject) => {
    const type = q.type || "mcq";
    const category = q.category || (type === "mcq" ? "qcm" : type === "progressive_clue" ? "progressive" : "open");
    // Store clues in choices column if type is progressive_clue
    let choicesStr = null;
    if (q.choices) choicesStr = JSON.stringify(q.choices);
    else if (q.clues) choicesStr = JSON.stringify(q.clues);
    
    const idx = q.answerIndex !== undefined ? q.answerIndex : null;
    const ans = q.answer || null;

    db.run(
      "INSERT INTO questions_v2 (type, category, question, choices, answerIndex, answer) VALUES (?, ?, ?, ?, ?, ?)",
      [type, category, q.question, choicesStr, idx, ans],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...q });
      }
    );
  });
}

export function deleteQuestion(id) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM questions_v2 WHERE id = ?", [id], function (err) {
      if (err) reject(err);
      else resolve({ deletedId: id });
    });
  });
}

export function deleteAllAutoGeneratedQuestions() {
  return new Promise((resolve, reject) => {
    // Delete questions that likely came from imports (we can't distinguish perfectly unless we add a column,
    // but for now let's just delete everything that is MCQ and not in the manual seed)
    // Actually, safest is to delete ALL questions then re-seed manual ones.
    
    db.run("DELETE FROM questions_v2", [], function(err) {
        if (err) reject(err);
        else {
            seedQuestions(); // Re-add the hardcoded ones from code
            resolve({ count: this.changes });
        }
    });
  });
}

// --- ADMIN FUNCTIONS ---

export function getAllUsers() {
    return new Promise((resolve, reject) => {
        db.all("SELECT id, username, elo, created_at FROM users ORDER BY created_at DESC", [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

export function deleteUser(id) {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
            if (err) reject(err);
            else resolve({ deletedId: id });
        });
    });
}

export function getAllMatches() {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM matches ORDER BY timestamp DESC LIMIT 100", [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

