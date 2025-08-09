require("dotenv").config();
const express = require("express");
const path = require("path");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const Leaderboard = require("./Models/leaderboard-modal.js");
const { Server } = require("socket.io");


const router = require('./route.js');
const DbConnect = require('./database.js');
const loadModals = require("./helper/Attendance/loadModals.js");
loadModals();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:5173", "https://thought-labv2.netlify.app", "http://localhost:3000"],
  credentials: true
}));
app.use(express.json({ limit: "8mb" }));
app.use("/storage", express.static("storage"));
app.use("/models", express.static(path.join(__dirname, "public", "models")));


app.use(router);
DbConnect(); 

// Root route
app.get("/", (req, res) => {
  console.log("App is working fine");
  res.send("App is working fine");
});

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", 
    credentials: true
  }
});

io.on("connection", async (socket) => {
    console.log(`🟢 Client connected: ${socket.id}`);
  
    // Send initial leaderboard from DB
    socket.on("get-initial-leaderboard", async () => {
      const data = await Leaderboard.find().sort({ score: -1 }); // top scores first
      socket.emit("leaderboard-data", data);
    });
  
    // Update score in DB
    socket.on("update-score", async (updatedEntry) => {
      console.log("Received update from server:", updatedEntry);
      const existing = await Leaderboard.findOne({ _id: updatedEntry.id });
  
      let updatedDoc;
  
      if (existing) {
        // Merge and update
        updatedDoc = await Leaderboard.findByIdAndUpdate(
          updatedEntry.id,
          { $set: {score : updatedEntry.score} },
          { new: true }
        );
        console.log(updatedDoc);
      } else {
        // Insert new
        updatedDoc = await Leaderboard.create(updatedEntry);
      }
  
      // Send updated list to all clients
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
