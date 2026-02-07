const mongoose = require("mongoose");

const LeaderboardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User collection
      required: true,
    },
    score: { type: Number, default: 100},
  },
  { timestamps: true }
);

module.exports = mongoose.models.Leaderboard || mongoose.model("Leaderboard", LeaderboardSchema);
