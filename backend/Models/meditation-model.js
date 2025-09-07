const mongoose = require('mongoose');

const meditationSchema = new mongoose.Schema({
  score: {
    type: Number,
    default : 0,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default : 0,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Meditation', meditationSchema);