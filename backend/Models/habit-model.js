const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    emoji: {
        type: String,
        default: '⭐'
    },
    color: {
        type: String,
        default: '#6366f1'
    },
    // 'check' = simple checkbox habit, 'time' = duration-tracked habit
    habitType: {
        type: String,
        enum: ['check', 'time'],
        default: 'check'
    },
    // Each entry is a date string 'YYYY-MM-DD' for when the habit was completed
    completions: {
        type: [String],  // e.g. ["2026-04-01", "2026-04-03"]
        default: []
    },
    // For time-type habits: duration logged per day (in minutes)
    timeLogs: {
        type: [{ date: String, minutes: { type: Number, default: 0 } }],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
