const Meditation = require('../Models/meditation-model.js');

class meditationService {
    async meditationHistory(date){
        let query = {};
        console.log("meditationHistory called with date:", date);
        if (date) {
            // Adjust for potential timezone issues: 
            // Interpret the date string as the start of the day in the local timezone
            const [year, month, day] = date.split('-').map(Number);
            const start = new Date(year, month - 1, day, 0, 0, 0, 0);
            const end = new Date(year, month - 1, day, 23, 59, 59, 999);
            query.date = { $gte: start, $lte: end };
            console.log("Query date range:", start, "to", end);
        }
        const sessions = await Meditation.find(query).sort({date: -1}).limit(50);
        console.log("Found sessions:", sessions.length);
        return sessions;
    }

    async meditationSession(score, details, duration, date, profilePicture, name, userId){
        const newSession = new Meditation({
            score,
            details,
            duration,
            date: date || new Date(),
            profilePicture : profilePicture,
            name : name,
            user: userId
        });
        await newSession.save();

        // console.log(newSession);

        return newSession;
    }
}

module.exports = new meditationService();