const mongoose = require("mongoose");

const scoreHistorySchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  reason: { type: String, default: '' },
  awardedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completionRatio: { type: Number, default: 0 }, // snapshot of student's completion rate at time of award
  rawPoints: { type: Number }, // mentor's raw input before multiplier
  awardedAt: { type: Date, default: Date.now }
});

const LeaderboardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    score: { type: Number, default: 0 },
    scoreHistory: [scoreHistorySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.models.Leaderboard || mongoose.model("Leaderboard", LeaderboardSchema);
