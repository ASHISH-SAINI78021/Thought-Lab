require("dotenv").config();
const express = require("express");
const path = require("path");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const User = require("./Models/user-model.js");

const Leaderboard = require("./Models/leaderboard-modal.js");
const router = require("./route.js");
const DbConnect = require("./database.js");
const loadModals = require("./helper/Attendance/loadModals.js");

loadModals();

const app = express();
const server = http.createServer(app);

// Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "https://thought-labv2.netlify.app",
      "http://localhost:3000",
      "http://localhost:5173",
      "*"
    ],
    credentials: true,
  })
);

// ✅ Only parse JSON if not multipart
app.use((req, res, next) => {
  if (req.is("multipart/form-data")) {
    return next();
  }
  express.json({ limit: "8mb" })(req, res, next);
});

// Static files
app.use("/storage", express.static("storage"));
app.use("/models", express.static(path.join(__dirname, "public", "models")));

// Routes
app.use(router);

// DB connection is now strictly handled in startServer()
// DbConnect(); 

// Root route
app.get("/", (req, res) => {
  console.log("📡 Root route hit - App is working fine");
  res.send("Thought Lab Backend is working fine");
});

// Ping route for health check
app.get("/ping", (req, res) => {
  console.log("💓 Ping hit");
  res.json({ success: true, timestamp: new Date().toISOString() });
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

// Pass io to routes/controllers if needed
global.io = io;
app.set("io", io);

let activeUserCount = 0;
io.on("connection", async (socket) => {
  console.log(`🟢 Client connected: ${socket.id}`);
  activeUserCount++;
  io.emit("active-users-update", activeUserCount);
  // Send initial leaderboard with user details
  socket.on("get-initial-leaderboard", async () => {
    let data = await Leaderboard.find()
      .populate("user", "name rollNumber branch year")
      .sort({ score: -1 });
  
    // If empty, auto-create from users
    if (data.length === 0) {
      const users = await User.find();
      const entries = users.map(u => ({ user: u._id, score: 100 }));
      await Leaderboard.insertMany(entries);
      // console.log(entries);
  
      data = await Leaderboard.find()
        .populate("user", "name rollNumber branch year")
        .sort({ score: -1 });
    }

    // console.log(data);
  
    socket.emit("leaderboard-data", data);
  });

  // Update score in DB
  socket.on("update-score", async (updatedEntry) => {
    console.log("Received score update:", updatedEntry);
    const { userId, score } = updatedEntry;

    let updatedDoc;

    // Check if user already exists in leaderboard
    const existing = await Leaderboard.findOne({ user: userId });

    if (existing) {
      updatedDoc = await Leaderboard.findByIdAndUpdate(
        existing._id,
        { $set: { score } },
        { new: true }
      );
    } else {
      updatedDoc = await Leaderboard.create({
        user: userId,
        score,
      });
    }

    // Send updated list to everyone with populated user data
    const fullLeaderboard = await Leaderboard.find()
      .populate("user", "name rollNumber branch")
      .sort({ score: -1 });

    io.emit("leaderboard-update", fullLeaderboard);
  });

  socket.on("disconnect", () => {
    activeUserCount--;
    io.emit("active-users-update", activeUserCount);
    console.log(`🔴 Client disconnected: ${socket.id}`);
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start the server
const PORT = process.env.PORT || 5500;
async function startServer() {
  try {
    await DbConnect();
    server.listen(PORT, () => {
      console.log(`✅ Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
}

startServer();
