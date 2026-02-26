import express from "express";
import http from "http";
import { Server } from "socket.io";
import { attachMatchmaking } from "./services/matchmaking.js";
import { 
  getAllQuestions, 
  addQuestion, 
  deleteQuestion, 
  forceSeedQuestions,
  getAllUsers,
  deleteUser,
  getAllMatches,
  updateUserEloById
} from "./db/database.js";

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  next();
});

const io = new Server(server, {
  cors: { origin: "*" },
});

app.get("/", (_req, res) => {
  res.json({ ok: true, name: "qna-1v1-server" });
});

// Admin Routes
app.get("/admin/questions", async (req, res) => {
  try {
    const questions = await getAllQuestions();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/admin/questions", async (req, res) => {
  try {
    const q = req.body;
    // Basic validation
    if (!q.question) return res.status(400).json({ error: "Question requise" });
    
    const result = await addQuestion(q);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/admin/questions/import", async (req, res) => {
  try {
    console.log("Importing default questions via Admin API...");
    await forceSeedQuestions();
    const questions = await getAllQuestions();
    res.json(questions);
  } catch (err) {
    console.error("Error importing:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/admin/questions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await deleteQuestion(id);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Users Routes
app.get("/admin/users", async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/admin/users/:id", async (req, res) => {
    try {
        await deleteUser(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/admin/users/:id/elo", async (req, res) => {
    try {
        const { elo } = req.body;
        await updateUserEloById(req.params.id, elo);
        res.json({ success: true, elo });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Match History
app.get("/admin/matches", async (req, res) => {
    try {
        const matches = await getAllMatches();
        res.json(matches);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

attachMatchmaking(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
