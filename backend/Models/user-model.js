const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true },
    rollNumber: { type: String, required: true },
    year: { type: String, required: false },
    branch: { type: String, required: false },
    programme: { type: String, required: false },
    email: { type: String, required: false },
    phone: { type: String },
    password: { type: String, required: true },
    faceId: {
        type: [[Number]],  // Store multiple face descriptors for one user
        required: false
    },
    profilePicture: {
        type: String,
        required: false,
        // get: (avatar) => avatar ? `${process.env.BASE_URL}/${avatar}` : avatar
    },
    attendance : [
        {
            date : String,
            Time : String,
            status : String
        }
    ],
    role: { type: String, enum: ['user', 'admin', 'superAdmin'], default: 'user' }
}, {
    timestamps: true,
    toJSON: { getters: true }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema, 'users');
