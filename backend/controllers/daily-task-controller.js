const DailyTask = require('../Models/daily-task-model.js');
const Task = require('../Models/task-model.js');
const Habit = require('../Models/habit-model.js');
const User = require('../Models/user-model.js');

class DailyTaskController {
    // ---------------- STUDENT METHODS ----------------
    async createDailyTask(req, res) {
        try {
            const { title, description, priority, dueTime } = req.body;
            if (!title) {
                return res.status(400).json({ success: false, message: "Title is required." });
            }

            const task = new DailyTask({
                title,
                description,
                priority,
                dueTime,
                student: req.user._id
            });
            await task.save();

            return res.json({ success: true, task });
        } catch (error) {
            console.error("Error creating daily task:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getMyTasks(req, res) {
        try {
            // Can add date filtering here later if needed, starting with all 
            const tasks = await DailyTask.find({ student: req.user._id }).sort({ createdAt: -1 });
            return res.json({ success: true, tasks });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateTaskStatus(req, res) {
        try {
            const { taskId } = req.params;
            const { status } = req.body; // 'To Do', 'In Progress', 'Completed'

            const task = await DailyTask.findOne({ _id: taskId, student: req.user._id });
            if (!task) {
                return res.status(404).json({ success: false, message: "Task not found." });
            }

            task.status = status;
            if (status === 'Completed') {
                task.completedAt = new Date();
            }
            await task.save();

            return res.json({ success: true, task });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateTaskDetails(req, res) {
        try {
            const { taskId } = req.params;
            const { title, description, priority, dueTime } = req.body;

            const task = await DailyTask.findOne({ _id: taskId, student: req.user._id });
            if (!task) {
                return res.status(404).json({ success: false, message: "Task not found." });
            }
            if (task.status === 'Completed') {
                return res.status(400).json({ success: false, message: "Cannot edit a completed task." });
            }

            task.title = title || task.title;
            task.description = description !== undefined ? description : task.description;
            task.priority = priority || task.priority;
            task.dueTime = dueTime || task.dueTime;

            await task.save();
            return res.json({ success: true, task });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async deleteMyTask(req, res) {
        try {
            const { taskId } = req.params;
            const task = await DailyTask.findOne({ _id: taskId, student: req.user._id });
            if (!task) {
                return res.status(404).json({ success: false, message: "Task not found." });
            }

            if (task.status === 'Completed') {
                return res.status(400).json({ success: false, message: "Cannot delete a completed task." });
            }

            await DailyTask.findByIdAndDelete(taskId);
            return res.json({ success: true, message: "Task deleted successfully." });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    // ---------------- MENTOR/ADMIN METHODS ----------------

    async getStudentTasks(req, res) {
        try {
            const { studentId } = req.params;
            const student = await User.findById(studentId);
            if (!student) {
                return res.status(404).json({ success: false, message: "Student not found." });
            }

            // check mentor authorization
            if (req.user.role === 'mentor') {
                const studentMentorId = student.mentorId?.toString();
                const currentMentorId = req.user._id?.toString();
                
                if (studentMentorId !== currentMentorId) {
                    console.log(`❌ [Auth Error] Mentor ${currentMentorId} tried to access student ${studentId} (Assigned Mentor: ${studentMentorId})`);
                    return res.status(403).json({ 
                        success: false, 
                        message: "You are not assigned to this student.",
                        debug: { studentMentorId, currentMentorId } 
                    });
                }
            }

            const [dailyTasksRaw, assignedTasksRaw, habits] = await Promise.all([
                DailyTask.find({ student: studentId }).sort({ createdAt: -1 }).lean(),
                Task.find({ assignedTo: studentId }).sort({ createdAt: -1 }).lean(),
                Habit.find({ student: studentId }).sort({ createdAt: 1 }).lean()
            ]);

            console.log(`🔍 [MentorView] Found ${dailyTasksRaw.length} daily, ${assignedTasksRaw.length} assigned, and ${habits.length} habits for student ${studentId}`);

            // Map assignedTasks to match the DailyTask structure for UI compatibility
            const normalizedAssigned = assignedTasksRaw.map(t => ({
                ...t,
                isAssignedTask: true // flag for UI special handling if needed
            }));

            const combinedTasks = [...dailyTasksRaw, ...normalizedAssigned];

            return res.json({ 
                success: true, 
                tasks: combinedTasks,
                habits: habits 
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async addCommentToTask(req, res) {
        try {
            const { taskId } = req.params;
            const { text } = req.body;

            if (!text) {
                return res.status(400).json({ success: false, message: "Comment text is required." });
            }

            // Try to find in DailyTask first
            let task = await DailyTask.findById(taskId).populate('student');
            let isDaily = true;

            if (!task) {
                // Try to find in Task (Assigned Tasks)
                task = await Task.findById(taskId).populate('assignedTo');
                isDaily = false;
            }

            if (!task) {
                return res.status(404).json({ success: false, message: "Task not found." });
            }

            // Authorization check
            const student = isDaily ? task.student : task.assignedTo;
            if (req.user.role === 'mentor' && student.mentorId?.toString() !== req.user._id.toString()) {
                return res.status(403).json({ success: false, message: "Cannot comment on this student's task." });
            }

            task.comments.push({
                text,
                mentorId: req.user._id,
                createdAt: new Date()
            });

            await task.save();
            return res.json({ success: true, task });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new DailyTaskController();
