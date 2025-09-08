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
  },
  profilePicture : {
    type : String,
    required : false,
    default : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
  },
  name : {
    type : String, 
    required : true
  }
});

module.exports = mongoose.model('Meditation', meditationSchema);