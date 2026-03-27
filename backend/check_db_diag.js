const mongoose = require('mongoose');
const Task = require('./Models/task-model.js');
const Meditation = require('./Models/meditation-model.js');
const User = require('./Models/user-model.js');
require('dotenv').config();

async function checkData() {
    try {
        const uri = process.env.DB_URL;
        if (!uri) {
            console.error("DB_URL not found in .env");
            process.exit(1);
        }
        await mongoose.connect(uri);
        console.log("Connected to MongoDB Atlas");

        const completedTasks = await Task.find({ status: { $in: ['COMPLETED', 'FAILED'] } });
        console.log(`Total Completed/Failed Tasks: ${completedTasks.length}`);
        completedTasks.forEach(t => {
            console.log(`- Task: ${t.title}, Status: ${t.status}, AssignedTo: ${t.assignedTo}`);
        });

        const meditations = await Meditation.find();
        console.log(`Total Meditations: ${meditations.length}`);
        meditations.forEach(m => {
            console.log(`- Meditation: ${m.details}, User: ${m.user}, Name: ${m.name}`);
        });

        const users = await User.find().select('name rollNumber');
        console.log(`Total Users: ${users.length}`);
        users.forEach(u => {
            console.log(`- User: ${u.name}, ID: ${u._id}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkData();
