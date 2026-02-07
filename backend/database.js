const mongoose = require('mongoose');

async function DbConnect() {
    try {
        const conn = await mongoose.connect(process.env.DB_URL, {
            // New options for stability to prevent ECONNRESET
            serverSelectionTimeoutMS: 5000, 
            socketTimeoutMS: 45000,
        });
        console.log(`Db connected ${conn.connection.host}`);
    } catch (error) {
        console.error('DB Connection Error:', error);
        // process.exit(1); // Do not exit, let it retry? Mongoose auto-reconnects. 
        // But initial connection fail is fatal usually.
    }
}

module.exports = DbConnect;