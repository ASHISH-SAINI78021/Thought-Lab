const Meditation = require('../Models/meditation-model.js');

class meditationService {
    async meditationHistory(){
        const sessions = await Meditation.find().sort({date: -1});
        return sessions;
    }

    async meditationSession(score, details, duration, date){
        const newSession = new Meditation({
            score,
            details,
            duration,
            date: date || new Date()
        });
        await newSession.save();

        return newSession;
    }
}

module.exports = new meditationService();