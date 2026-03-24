const mongoose = require('mongoose');

async function DbConnect() {
    console.log('Attempting to connect to MongoDB...');
    try {
        // Increase global buffering timeout to 30s
        mongoose.set('bufferTimeoutMS', 30000);

        const conn = await mongoose.connect(process.env.DB_URL, {
            maxPoolSize: 50,
            serverSelectionTimeoutMS: 10000, // Increased timeout 
            socketTimeoutMS: 45000,
            family: 4, // Force IPv4 to avoid Render/Atlas IPv6 issues
        });
        console.log(`✅ MongoDB Connected to: ${conn.connection.name}`);
        return conn;
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        throw error;
    }
}

module.exports = DbConnect;