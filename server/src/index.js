import express from "express";
import http from "http";
import { Server } from "socket.io";
import { attachMatchmaking } from "./services/matchmaking.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

app.get("/", (_req, res) => {
  res.json({ ok: true, name: "qna-1v1-server" });
});

attachMatchmaking(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
