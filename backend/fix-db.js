const mongoose = require('mongoose');
const User = require('./Models/user-model.js');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUD_SECRET
});

async function run() {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to DB");
        const users = await User.find({ profilePicture: { $regex: /^storage\/ThoughtLab/ } });
        console.log(`Found ${users.length} users with corrupted profile pictures.`);
        
        for (let user of users) {
            // Remove 'storage/' from the beginning
            const publicId = user.profilePicture.replace('storage/', '');
            // Generate full Cloudinary url
            const fullUrl = cloudinary.url(publicId, { secure: true });
            
            user.profilePicture = fullUrl;
            await user.save();
            console.log(`Fixed user ${user.name}: ${fullUrl}`);
        }
        
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
run();
