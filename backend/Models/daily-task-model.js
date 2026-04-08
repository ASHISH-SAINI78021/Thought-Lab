const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    text: { type: String, required: true },
    mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

const dailyTaskSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    priority: { 
        type: String, 
        enum: ['Low', 'Medium', 'High'], 
        default: 'Medium' 
    },
    dueTime: { type: String }, // e.g. "by 5 PM today"
    status: { 
        type: String, 
        enum: ['To Do', 'In Progress', 'Completed'], 
        default: 'To Do' 
    },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comments: [commentSchema],
    completedAt: { type: Date }
}, {
    timestamps: true
});

module.exports = mongoose.models.DailyTask || mongoose.model('DailyTask', dailyTaskSchema, 'dailyTasks');
