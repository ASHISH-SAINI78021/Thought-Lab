const mongoose = require("mongoose");

const LeaderboardSchema = new mongoose.Schema({
  name: String,
  rollNumber: String,
  branch: String,
  year: String,
  score: Number,
}, { timestamps: true });

module.exports = mongoose.model("Leaderboard", LeaderboardSchema);
