const Meditation = require('../Models/meditation-model.js');

class meditationService {
    async meditationHistory(){
        const sessions = await Meditation.find().sort({date: -1}).limit(10);
        return sessions;
    }

    async meditationSession(score, details, duration, date, profilePicture, name){
        const newSession = new Meditation({
            score,
            details,
            duration,
            date: date || new Date(),
            profilePicture : profilePicture,
            name : name
        });
        await newSession.save();

        // console.log(newSession);

        return newSession;
    }
}

module.exports = new meditationService();