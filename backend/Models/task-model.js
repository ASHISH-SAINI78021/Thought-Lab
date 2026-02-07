const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    scoreReward: { type: Number, required: true, default: 0 },
    scorePenalty: { type: Number, required: true, default: 0 },
    deadline: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['OPEN', 'ASSIGNED', 'COMPLETED', 'FAILED'], 
        default: 'OPEN' 
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    bidders: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    completedAt: { type: Date }
}, {
    timestamps: true
});

module.exports = mongoose.models.Task || mongoose.model('Task', taskSchema, 'tasks');
