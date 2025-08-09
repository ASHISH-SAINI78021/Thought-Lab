require("dotenv").config();
const express = require("express");
const path = require("path");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");

const Leaderboard = require("./Models/leaderboard-modal.js");
const router = require("./route.js");
const DbConnect = require("./database.js");
const loadModals = require("./helper/Attendance/loadModals.js");

loadModals();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "https://thought-labv2.netlify.app",
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

// ✅ Only parse JSON if it's not multipart
app.use((req, res, next) => {
  if (req.is("multipart/form-data")) {
    return next(); // skip JSON parsing for file uploads
  }
  express.json({ limit: "8mb" })(req, res, next);
});

// Static files
app.use("/storage", express.static("storage"));
app.use("/models", express.static(path.join(__dirname, "public", "models")));

// Routes
app.use(router);

// DB connection
DbConnect();

// Root route
app.get("/", (req, res) => {
  console.log("App is working fine");
  res.send("App is working fine");
});

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: [
      "https://thought-labv2.netlify.app",
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
  },
});

io.on("connection", async (socket) => {
  console.log(`🟢 Client connected: ${socket.id}`);

  // Send initial leaderboard
  socket.on("get-initial-leaderboard", async () => {
    const data = await Leaderboard.find().sort({ score: -1 });
    socket.emit("leaderboard-data", data);
  });

  // Update score in DB
  socket.on("update-score", async (updatedEntry) => {
    console.log("Received update from server:", updatedEntry);
    const existing = await Leaderboard.findOne({ _id: updatedEntry.id });

    let updatedDoc;

    if (existing) {
      // Update existing
      updatedDoc = await Leaderboard.findByIdAndUpdate(
        updatedEntry.id,
        { $set: { score: updatedEntry.score } },
        { new: true }
      );
    } else {
      // Insert new
      updatedDoc = await Leaderboard.create(updatedEntry);
    }

    // Send updated list
    const fullLeaderboard = await Leaderboard.find().sort({ score: -1 });
    io.emit("leaderboard-update", fullLeaderboard);
  });

  socket.on("disconnect", () => {
    console.log(`🔴 Client disconnected: ${socket.id}`);
  });
});

// Start the server
const PORT = process.env.PORT || 5500;
server.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
