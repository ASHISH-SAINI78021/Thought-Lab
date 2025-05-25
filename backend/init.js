require("dotenv").config();
const mongoose = require("mongoose");
const Leaderboard = require("./Models/leaderboard-modal.js");

const leaderboard = [
  { name: "Dakota Rice", rollNumber: "IT20U001", branch: "IT", year: "Final", score: 91 },
  { name: "Minerva Hooper", rollNumber: "IT20U002", branch: "IT", year: "Third", score: 88 },
  { name: "Sage Rodriguez", rollNumber: "IT20U003", branch: "CSE", year: "Second", score: 78 },
  { name: "Philip Chaney", rollNumber: "IT20U004", branch: "ECE", year: "Final", score: 85 },
  { name: "Mason Beck", rollNumber: "IT20U005", branch: "ME", year: "Second", score: 92 },
  { name: "Cody Fisher", rollNumber: "IT20U006", branch: "EE", year: "Third", score: 80 },
  { name: "Kristin Watson", rollNumber: "IT20U007", branch: "IT", year: "First", score: 77 },
  { name: "Savannah Nguyen", rollNumber: "IT20U008", branch: "CE", year: "Second", score: 69 },
];

const connectAndSeed = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    await Leaderboard.deleteMany(); // Optional: Clear existing entries
    await Leaderboard.insertMany(leaderboard);
    console.log("✅ Leaderboard data inserted successfully");

    process.exit();
  } catch (err) {
    console.error("❌ Error inserting data:", err);
    process.exit(1);
  }
};

connectAndSeed();
