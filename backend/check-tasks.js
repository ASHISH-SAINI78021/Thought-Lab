const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./Models/user-model');
const Task = require('./Models/task-model');

async function checkTasks() {
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to DB');

    const tasks = await Task.find({}).populate('assignedTo');
    console.log('Total Tasks:', tasks.length);

    tasks.forEach(task => {
        console.log(`Task: ${task.title}`);
        console.log(`Status: ${task.status}`);
        if (task.assignedTo) {
            console.log(`Assigned To: ${task.assignedTo.name} (${task.assignedTo.email})`);
        } else {
            console.log('Assigned To: NONE');
        }
        console.log('---');
    });

    const users = await User.find({});
    console.log('Total Users:', users.length);
    users.forEach(user => {
        console.log(`User: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
    });

    await mongoose.disconnect();
}

checkTasks();
