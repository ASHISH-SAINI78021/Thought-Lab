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
    focusPet: {
        level: { type: Number, default: 1 },
        xp: { type: Number, default: 0 },
        petType: { type: String, default: 'seed' }
    },
    badges: [
        {
            id: { type: String },
            name: { type: String },
            icon: { type: String },
            description: { type: String },
            earnedAt: { type: Date, default: Date.now }
        }
    ],
    petStats: {
        blogsRead: { type: Number, default: 0 },
        meditationsLogged: { type: Number, default: 0 }
    },
    attendance : [
        {
            date : String,
            Time : String,
            status : String
        }
    ],
    mentorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    role: { type: String, enum: ['user', 'admin', 'superAdmin', 'mentor', 'student'], default: 'user' }
}, {
    timestamps: true,
    toJSON: { getters: true }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema, 'users');
