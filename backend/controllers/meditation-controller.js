const meditationService = require('../services/meditation-service.js');
const Leaderboard = require('../Models/leaderboard-modal.js');

class MeditationController {
    async meditationHistory(req, res){
        try {
            const { date } = req.query;
            const sessions = await meditationService.meditationHistory(date);
            if (!sessions.length){
                console.log("NO sessions");
                return res.json({
                    success : false,
                    message : "No meditation sessions yet"
                });
            }

            return res.json({
                success : true,
                sessions
            });
        }
        catch (err){
            console.log(err);
            return res.json({
                success : false,
                err
            });
        }
    }

    async meditationSession(req, res) {
        try {
            const { id } = req.params; // This is userId
            const { score, details, duration, date, name, profilePicture } = req.body;
            
            if (!name || !details) {
                console.log("All fields are required");
                return res.status(400).json({
                    success: false,
                    message: "All fields are required"
                });
            }
    
            // Validate score
            const scoreValue = score || 0;
    
            // Update leaderboard directly
            let updatedDoc;
            const existing = await Leaderboard.findOne({ user: id });
    
            if (existing) {
                updatedDoc = await Leaderboard.findByIdAndUpdate(
                    existing._id,
                    { $inc: { score: scoreValue } },
                    { new: true }
                ).populate("user", "name rollNumber branch year");
            }
    
            // Emit leaderboard update to all clients
            if (global.io) {
                const fullLeaderboard = await Leaderboard.find()
                    .populate("user", "name rollNumber branch year")
                    .sort({ score: -1 });
                global.io.emit("leaderboard-update", fullLeaderboard);
            }

    
            // Create meditation session
            const session = await meditationService.meditationSession(scoreValue, details, duration, date, profilePicture, name, id);
    
            return res.json({
                success: true,
                session,
            });
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                error: err.message
            });
        }
    }

    async resetUserMeditation(req, res) {
        try {
            const { id } = req.params; // userId
            const User = require('../Models/user-model.js');
            const Meditation = require('../Models/meditation-model.js');
            const Leaderboard = require('../Models/leaderboard-modal.js');

            // 1. Delete all meditation sessions
            await Meditation.deleteMany({ user: id });

            // 2. Reset Leaderboard score
            await Leaderboard.findOneAndUpdate(
                { user: id },
                { score: 0 },
                { upsert: true }
            );

            // 3. Reset User stats
            await User.findByIdAndUpdate(id, {
                'petStats.meditationsLogged': 0,
                'focusPet.level': 1,
                'focusPet.xp': 0
            });

            // 4. Emit live update
            if (global.io) {
                // Soul Leaderboard
                const fullLeaderboard = await Leaderboard.find()
                    .populate("user", "name rollNumber branch year")
                    .sort({ score: -1 });
                global.io.emit("leaderboard-update", fullLeaderboard);

                // Pet Leaderboard
                const petLeaders = await User.find({ "focusPet.level": { $exists: true } })
                    .sort({ "focusPet.level": -1, "focusPet.xp": -1 })
                    .limit(10)
                    .select("name rollNumber profilePicture focusPet");
                global.io.emit("pet-leaderboard-update", petLeaders);
            }

            return res.json({
                success: true,
                message: "Meditation data and leaderboard score have been successfully reset."
            });
        } catch (err) {
            console.error("Error resetting meditation data:", err);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
}

module.exports = new MeditationController();