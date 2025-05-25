const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true },
    rollNumber: { type: String, required: true },
    year: { type: Number, required: true },
    branch: { type: String, required: true },
    programme: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    faceId: {
        type: [[Number]],  // Store multiple face descriptors for one user
        required: false
    },
    avatar: {
        type: String,
        required: false,
        get: (avatar) => avatar ? `${process.env.BASE_URL}${avatar}` : avatar
    }
}, {
    timestamps: true,
    toJSON: { getters: true }
});

module.exports = mongoose.model('User', userSchema, 'users');
