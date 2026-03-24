const mongoose = require("mongoose");
const User = require("./backend/Models/user-model.js");
const DbConnect = require("./backend/database.js");

async function run() {
  await DbConnect();
  const superAdmins = await User.find({ role: "superAdmin" });
  console.log("SuperAdmins found:", superAdmins.map(u => ({ email: u.email, role: u.role })));
  process.exit();
}
run();
