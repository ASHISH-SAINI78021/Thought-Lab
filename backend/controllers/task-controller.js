const Task = require('../Models/task-model');
const User = require('../Models/user-model');
const Leaderboard = require('../Models/leaderboard-modal');
const emailService = require('../services/email-service');

class TaskController {
    // Create a new task
    async createTask(req, res) {
        try {
            const { title, description, scoreReward, scorePenalty, deadline } = req.body;
            
            const task = await Task.create({
                title,
                description,
                scoreReward,
                scorePenalty,
                deadline
            });

            // Broadcast new task notification
            const NotificationController = require('./notification-controller');
            await NotificationController.broadcastNotification(
                `New Task Available: ${task.title}`,
                'NEW_TASK',
                '/task-dashboard'
            );

            // Optional: Email notification (commented out as per previous code)
            // await emailService.sendNewTaskNotification(task);

            return res.status(201).json({ success: true, task });
        } catch (error) {
            console.error("Error creating task:", error);
            return res.status(500).json({ success: false, message: "Interna Server Error" });
        }
    }

    // Get all tasks (with filters)
    async getAllTasks(req, res) {
        try {
            const { status } = req.query;
            let query = {};
            if (status) query.status = status;

            const tasks = await Task.find(query)
                .populate('assignedTo', 'name email rollNumber')
                .populate('bidders', 'name email rollNumber')
                .sort({ createdAt: -1 });

            return res.json({ success: true, tasks });
        } catch (error) {
            console.error("Error fetching tasks:", error);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    // Student bids on a task
    async bidOnTask(req, res) {
        try {
            const { taskId } = req.params;
            const userId = req.user._id;

            const task = await Task.findById(taskId);
            if (!task) return res.status(404).json({ success: false, message: "Task not found" });

            if (task.status !== 'OPEN') {
                return res.status(400).json({ success: false, message: "Task is not open for bidding" });
            }

            if (task.bidders.includes(userId)) {
                return res.status(400).json({ success: false, message: "Already bid on this task" });
            }

            task.bidders.push(userId);
            await task.save();

            return res.json({ success: true, message: "Bid placed successfully", task });
        } catch (error) {
            console.error("Error bidding on task:", error);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    // Admin assigns task to a bidder (or by email)
    async assignTask(req, res) {
        try {
            const { taskId } = req.params;
            const { userId, email } = req.body;

            const task = await Task.findById(taskId);
            if (!task) return res.status(404).json({ success: false, message: "Task not found" });

            let user;
            if (userId) {
                user = await User.findById(userId);
            } else if (email) {
                user = await User.findOne({ email });
            }

            if (!user) return res.status(404).json({ success: false, message: "User not found" });

            task.assignedTo = user._id;
            task.status = 'ASSIGNED';
            await task.save();

            // Send notification
            await emailService.sendTaskAssignmentEmail(user, task);
            
            // Create in-app notification
            const NotificationController = require('./notification-controller');
            await NotificationController.createNotification(
                user._id,
                `You have been assigned a new task: ${task.title}`,
                'TASK_ASSIGNED',
                '/task-dashboard'
            );

            return res.json({ success: true, message: "Task assigned successfully", task });
        } catch (error) {
            console.error("Error assigning task:", error);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    // Admin marks task as completed
    async completeTask(req, res) {
        try {
            const { taskId } = req.params;

            const task = await Task.findById(taskId);
            if (!task) return res.status(404).json({ success: false, message: "Task not found" });

            if (task.status !== 'ASSIGNED') {
                return res.status(400).json({ success: false, message: "Task is not in assigned state" });
            }

            task.status = 'COMPLETED';
            task.completedAt = new Date();
            await task.save();

            // Update Leaderboard Score
            let leaderboardEntry = await Leaderboard.findOne({ user: task.assignedTo });
            if (!leaderboardEntry) {
                // If user not in leaderboard, create entry with base score + reward
                leaderboardEntry = await Leaderboard.create({
                    user: task.assignedTo,
                    score: 100 + task.scoreReward // Assume base 100
                });
            } else {
                leaderboardEntry.score += task.scoreReward;
                await leaderboardEntry.save();
            }

            // Emit live score update if socket is available
            if (global.io) {
                const fullLeaderboard = await Leaderboard.find()
                  .populate("user", "name rollNumber branch")
                  .sort({ score: -1 });
                global.io.emit("leaderboard-update", fullLeaderboard);
            }

            // Send notification
            const user = await User.findById(task.assignedTo);
            await emailService.sendTaskCompletionEmail(user, task);

            return res.json({ success: true, message: "Task completed and score updated", task });
        } catch (error) {
            console.error("Error completing task:", error);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    // Admin marks task as failed
    async failTask(req, res) {
        try {
            const { taskId } = req.params;

            const task = await Task.findById(taskId);
            if (!task) return res.status(404).json({ success: false, message: "Task not found" });

             if (task.status !== 'ASSIGNED') {
                return res.status(400).json({ success: false, message: "Task is not in assigned state" });
            }

            task.status = 'FAILED';
            await task.save();

            // Update Leaderboard Score (Penalty)
            let leaderboardEntry = await Leaderboard.findOne({ user: task.assignedTo });
            if (leaderboardEntry) {
                leaderboardEntry.score = Math.max(0, leaderboardEntry.score - task.scorePenalty); // Prevent negative score?
                await leaderboardEntry.save();
            }

            // Emit live score update
             if (global.io) {
                const fullLeaderboard = await Leaderboard.find()
                  .populate("user", "name rollNumber branch")
                  .sort({ score: -1 });
                global.io.emit("leaderboard-update", fullLeaderboard);
            }

            // Send notification
            const user = await User.findById(task.assignedTo);
            await emailService.sendTaskFailureEmail(user, task);

            return res.json({ success: true, message: "Task marked as failed and score deducted", task });
        } catch (error) {
            console.error("Error failing task:", error);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    // Delete task
    async deleteTask(req, res) {
        try {
            const { taskId } = req.params;
            await Task.findByIdAndDelete(taskId);
            return res.json({ success: true, message: "Task deleted" });
        } catch (error) {
             console.error("Error deleting task:", error);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }
}

module.exports = new TaskController();
