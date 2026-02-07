const mongoose = require('mongoose');

async function DbConnect() {
    console.log('Attempting to connect to MongoDB...');
    try {
        // Increase global buffering timeout to 30s
        mongoose.set('bufferTimeoutMS', 30000);

        const conn = await mongoose.connect(process.env.DB_URL, {
            serverSelectionTimeoutMS: 30000, 
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        console.error('Please check if your IP is whitelisted in MongoDB Atlas (Access from Anywhere: 0.0.0.0/0)');
    }
}

module.exports = DbConnect;