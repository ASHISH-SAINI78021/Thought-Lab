const meditationService = require('../services/meditation-service.js');
const Leaderboard = require('../Models/leaderboard-modal.js');

class MeditationController {
    async meditationHistory(req, res){
        try {
            const sessions = await meditationService.meditationHistory();
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
            const session = await meditationService.meditationSession(scoreValue, details, duration, date, profilePicture, name);
    
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
}

module.exports = new MeditationController();