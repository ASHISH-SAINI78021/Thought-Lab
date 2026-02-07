const Notification = require('../models/notification-model');
const User = require('../models/user-model'); // Import User model

class NotificationController {
    async getNotifications(req, res) {
        try {
            // Validate user existence
            if (!req.user || !req.user._id) {
                console.error("NotificationController: No user in request");
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            
            console.log(`Fetching notifications for user: ${req.user._id}`);
            
            const notifications = await Notification.find({ user: req.user._id })
                .sort({ createdAt: -1 })
                .limit(20);
            
            const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });

            return res.json({ success: true, notifications, unreadCount });
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    async markAsRead(req, res) {
        try {
            const { notificationId } = req.body;
            if (notificationId) {
                await Notification.findByIdAndUpdate(notificationId, { read: true });
            } else {
                // Mark all as read
                await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
            }
            return res.json({ success: true });
        } catch (error) {
            console.error('Error marking notifications as read:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    // Create a new notification manually
    async createNotification(userId, message, type, link) {
        try {
            await Notification.create({
                user: userId,
                message,
                type,
                link,
                isRead: false
            });
        } catch (error) {
            console.error("Error creating notification:", error);
        }
    }

    // Broadcast notification to all users
    async broadcastNotification(message, type, link) {
        try {
            const users = await User.find({}, '_id');
            const notifications = users.map(user => ({
                user: user._id,
                message,
                type,
                link,
                isRead: false
            }));
            
            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }
        } catch (error) {
            console.error("Error broadcasting notification:", error);
        }
    }
}

module.exports = new NotificationController();
