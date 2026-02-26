import express from "express";
import http from "http";
import { Server } from "socket.io";
import { attachMatchmaking } from "./services/matchmaking.js";
import { getAllQuestions, addQuestion, deleteQuestion } from "./db/database.js";

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

app.delete("/admin/questions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await deleteQuestion(id);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

attachMatchmaking(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
