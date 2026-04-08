const DailyTask = require('../Models/daily-task-model.js');
const Task = require('../Models/task-model.js');
const Habit = require('../Models/habit-model.js');
const User = require('../Models/user-model.js');
const Leaderboard = require('../Models/leaderboard-modal.js');
const mongoose = require('mongoose');

class DashboardController {
    
    async getAdminDashboard(req, res) {
        try {
            const totalMentors = await User.countDocuments({ role: 'mentor' });
            const totalStudents = await User.countDocuments({ role: { $in: ['student', 'user'] } });

            // get today start and end
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const tasksCompletedToday = await DailyTask.countDocuments({
                status: 'Completed',
                completedAt: { $gte: startOfDay, $lte: endOfDay }
            });

            const tasksPending = await DailyTask.countDocuments({
                status: { $in: ['To Do', 'In Progress'] }
            });

            // Mentors list with student count
            const mentors = await User.aggregate([
                { $match: { role: 'mentor' } },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: 'mentorId',
                        as: 'students'
                    }
                },
                {
                    $project: {
                        name: 1,
                        email: 1,
                        studentCount: { $size: "$students" }
                    }
                }
            ]);

            return res.json({
                success: true,
                data: {
                    totalMentors,
                    totalStudents,
                    tasksCompletedToday,
                    tasksPending,
                    mentors
                }
            });

        } catch (error) {
            console.error("Admin dashboard error:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getMentorDashboard(req, res) {
        try {
            const mentorId = req.user._id;

            // My students
            const students = await User.find({ mentorId }).select('name email rollNumber profilePicture');

            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const todayStr = startOfDay.toISOString().split('T')[0];

            // Fetch stats for each student
            const studentCards = await Promise.all(students.map(async (student) => {
                const [todaysDaily, todaysAssigned, habits] = await Promise.all([
                    DailyTask.find({
                        student: student._id,
                        createdAt: { $gte: startOfDay, $lte: endOfDay }
                    }),
                    Task.find({
                        assignedTo: student._id,
                        $or: [
                            { status: 'ASSIGNED' }, 
                            { completedAt: { $gte: startOfDay, $lte: endOfDay } } 
                        ]
                    }),
                    Habit.find({ student: student._id })
                ]);

                const todaysTasks = [...todaysDaily, ...todaysAssigned];
                const completedTasksCount = todaysTasks.filter(t => t.status === 'Completed' || t.status === 'COMPLETED').length;
                
                // Habit stats for today
                const habitCount = habits.length;
                const habitsCompletedToday = habits.filter(h => h.completions.includes(todayStr)).length;

                // Combined stats
                const totalItemsToday = todaysTasks.length + habitCount;
                const totalCompletedToday = completedTasksCount + habitsCompletedToday;

                return {
                    _id: student._id,
                    name: student.name,
                    rollNumber: student.rollNumber,
                    profilePicture: student.profilePicture,
                    todaysTaskCount: totalItemsToday,
                    completedTaskCount: totalCompletedToday,
                    // Break down for UI if needed
                    breakdown: {
                        tasks: todaysTasks.length,
                        tasksCompleted: completedTasksCount,
                        habits: habitCount,
                        habitsCompleted: habitsCompletedToday
                    }
                };
            }));

            return res.json({
                success: true,
                data: {
                    students: studentCards
                }
            });

        } catch (error) {
            console.error("Mentor dashboard error:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * GET /mentor/students/:studentId/consistency  (or /student/consistency for self)
     * Returns last 7 days of task data for consistency chart
     */
    async getConsistencyData(req, res) {
        try {
            const studentId = req.params.studentId || req.user._id;

            const days = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const start = new Date(d);
                start.setHours(0, 0, 0, 0);
                const end = new Date(d);
                end.setHours(23, 59, 59, 999);

                const todayStr = d.toISOString().split('T')[0];

                const [dayDaily, dayAssigned, habits] = await Promise.all([
                    DailyTask.find({
                        student: studentId,
                        createdAt: { $gte: start, $lte: end }
                    }),
                    Task.find({
                        assignedTo: studentId,
                        $or: [
                            { createdAt: { $gte: start, $lte: end } },
                            { completedAt: { $gte: start, $lte: end } }
                        ]
                    }),
                    Habit.find({ student: studentId })
                ]);

                const dayHabitsCompleted = habits.filter(h => h.completions.includes(todayStr)).length;

                const total = dayDaily.length + dayAssigned.length + habits.length;
                const completed = dayDaily.filter(t => t.status === 'Completed').length + 
                                  dayAssigned.filter(t => t.status === 'COMPLETED').length +
                                  dayHabitsCompleted;

                days.push({
                    date: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
                    total,
                    completed,
                    rate: total > 0 ? Math.round((completed / total) * 100) : 0
                });
            }

            return res.json({ success: true, data: days });
        } catch (error) {
            console.error("Consistency data error:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * POST /mentor/students/:studentId/add-score
     * Body: { rawPoints: number (1-100), reason: string }
     * 
     * Fair Formula:
     *   completionRatio = completedToday / totalToday  (or 0 if no tasks)
     *   finalScore = rawPoints * (1 + completionRatio * 0.5)
     *   → Max multiplier 1.5× for 100% completion → rewards consistency
     */
    async addScoreToStudent(req, res) {
        try {
            const mentorId = req.user._id;
            const { studentId } = req.params;
            const { rawPoints, reason } = req.body;

            if (!rawPoints || rawPoints < 1 || rawPoints > 100) {
                return res.status(400).json({ success: false, message: 'Points must be between 1 and 100' });
            }

            // Get today's task completion ratio for this student
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const todayStr = startOfDay.toISOString().split('T')[0];

            const [todayDaily, todayAssigned, habits] = await Promise.all([
                DailyTask.find({
                    student: studentId,
                    createdAt: { $gte: startOfDay, $lte: endOfDay }
                }),
                Task.find({
                    assignedTo: studentId,
                    $or: [
                        { status: 'ASSIGNED' },
                        { completedAt: { $gte: startOfDay, $lte: endOfDay } }
                    ]
                }),
                Habit.find({ student: studentId })
            ]);

            const todayHabitsCompleted = habits.filter(h => h.completions.includes(todayStr)).length;

            const totalToday = todayDaily.length + todayAssigned.length + habits.length;
            const completedToday = todayDaily.filter(t => t.status === 'Completed').length + 
                                   todayAssigned.filter(t => t.status === 'COMPLETED').length +
                                   todayHabitsCompleted;

            const completionRatio = totalToday > 0 ? completedToday / totalToday : 0;

            // Apply fair formula
            const finalScore = Math.round(rawPoints * (1 + completionRatio * 0.5));

            // Upsert leaderboard entry
            let entry = await Leaderboard.findOne({ user: studentId });
            if (!entry) {
                entry = new Leaderboard({ user: studentId, score: 0, scoreHistory: [] });
            }

            entry.score += finalScore;
            entry.scoreHistory.push({
                amount: finalScore,
                rawPoints,
                reason: reason || '',
                awardedBy: mentorId,
                completionRatio,
                awardedAt: new Date()
            });

            await entry.save();

            // Broadcast live leaderboard update via socket
            if (global.io) {
                const fullLeaderboard = await Leaderboard.find()
                    .populate('user', 'name rollNumber branch')
                    .sort({ score: -1 });
                global.io.emit('leaderboard-update', fullLeaderboard);
            }

            return res.json({
                success: true,
                message: `Awarded ${finalScore} points (${rawPoints} raw × ${(1 + completionRatio * 0.5).toFixed(2)}× consistency bonus)`,
                finalScore,
                completionRatio: Math.round(completionRatio * 100),
                totalScore: entry.score
            });

        } catch (error) {
            console.error("Add score error:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * GET /leaderboard  — public leaderboard
     */
    async getLeaderboard(req, res) {
        try {
            const leaderboard = await Leaderboard.find()
                .populate('user', 'name rollNumber branch profilePicture')
                .sort({ score: -1 })
                .limit(50);
            return res.json({ success: true, leaderboard });
        } catch (error) {
            console.error("Leaderboard error:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new DashboardController();
