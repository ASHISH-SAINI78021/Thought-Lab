const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['TASK_ASSIGNED', 'TASK_COMPLETED', 'TASK_FAILED', 'INFO', 'NEW_TASK', 'NEW_BLOG', 'TASK_UNASSIGNED'], // Added NEW_TASK, NEW_BLOG
        default: 'INFO'
    },
    read: {
        type: Boolean,
        default: false
    },
    link: {
        type: String, // URL to redirect to
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema, 'notifications');
