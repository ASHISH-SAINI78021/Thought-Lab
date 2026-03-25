const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const User = require('../backend/Models/user-model');

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({ "attendance.0": { $exists: true } }).limit(5);
        console.log("Sample Attendance Data:");
        users.forEach(u => {
            console.log(`User: ${u.name}, Attendance:`, JSON.stringify(u.attendance, null, 2));
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
