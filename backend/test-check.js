const mongoose = require('mongoose');
const User = require('./Models/user-model.js');
require('dotenv').config();

async function check() {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to DB");
        const ashu = await User.findOne({ email: 'ashu78021@gmail.com' });
        if (ashu) {
            console.log("Found User. ProfilePicture is:", ashu.profilePicture);
        } else {
            console.log("User still not found. Trying to list all users...");
            const users = await User.find({}, 'name email profilePicture');
            console.log(users);
        }
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
check();
