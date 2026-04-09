const Habit = require('../Models/habit-model.js');
const User = require('../Models/user-model.js');

const toDateStr = (d) => d.toISOString().split('T')[0];

class HabitController {

    // GET /habits/my-habits
    async getMyHabits(req, res) {
        try {
            const habits = await Habit.find({ student: req.user._id }).sort({ createdAt: 1 });
            return res.json({ success: true, habits });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    // POST /habits  { name, emoji, color }
    async createHabit(req, res) {
        try {
            const { name, emoji, color } = req.body;
            if (!name) return res.status(400).json({ success: false, message: 'Habit name is required.' });

            const habit = await Habit.create({ student: req.user._id, name, emoji, color });
            return res.json({ success: true, habit });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    // PUT /habits/:id/toggle   — toggles today's completion
    async toggleHabit(req, res) {
        try {
            const habit = await Habit.findOne({ _id: req.params.id, student: req.user._id });
            if (!habit) return res.status(404).json({ success: false, message: 'Habit not found.' });

            const today = toDateStr(new Date());
            const idx = habit.completions.indexOf(today);
            if (idx === -1) {
                habit.completions.push(today);
            } else {
                habit.completions.splice(idx, 1);
            }
            await habit.save();
            return res.json({ success: true, habit });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    // PUT /habits/:id/toggle-date  { date: 'YYYY-MM-DD' }  — admin toggle for any date
    async toggleDate(req, res) {
        try {
            const { date } = req.body;
            const habit = await Habit.findOne({ _id: req.params.id, student: req.user._id });
            if (!habit) return res.status(404).json({ success: false, message: 'Habit not found.' });

            const idx = habit.completions.indexOf(date);
            if (idx === -1) habit.completions.push(date);
            else habit.completions.splice(idx, 1);
            await habit.save();
            return res.json({ success: true, habit });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    // POST /habits/:id/log-time  { date, minutes }
    async logTime(req, res) {
        try {
            const { date, minutes } = req.body;
            if (!date || minutes == null) return res.status(400).json({ success: false, message: 'date and minutes required.' });

            const habit = await Habit.findOne({ _id: req.params.id, student: req.user._id });
            if (!habit) return res.status(404).json({ success: false, message: 'Habit not found.' });

            // Add to timeLogs (accumulate for the day)
            const existing = habit.timeLogs.find(l => l.date === date);
            if (existing) {
                existing.minutes += Number(minutes);
            } else {
                habit.timeLogs.push({ date, minutes: Number(minutes) });
            }

            // Auto-mark as completed if any time logged
            if (!habit.completions.includes(date)) habit.completions.push(date);

            await habit.save();
            return res.json({ success: true, habit });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    // PUT /habits/:id
    async editHabit(req, res) {
        try {
            const { name, emoji, color, habitType } = req.body;
            const habit = await Habit.findOneAndUpdate(
                { _id: req.params.id, student: req.user._id },
                { $set: { name, emoji, color, habitType } },
                { new: true }
            );
            if (!habit) return res.status(404).json({ success: false, message: 'Habit not found.' });
            return res.json({ success: true, habit });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    // DELETE /habits/:id
    async deleteHabit(req, res) {
        try {
            const habit = await Habit.findOneAndDelete({ _id: req.params.id, student: req.user._id });
            if (!habit) return res.status(404).json({ success: false, message: 'Habit not found.' });
            return res.json({ success: true, message: 'Habit deleted.' });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    // --- MENTOR/ADMIN METHODS ---

    // GET /mentor/students/:studentId/habits
    async getStudentHabits(req, res) {
        try {
            const { studentId } = req.params;
            const student = await User.findById(studentId);
            if (!student) return res.status(404).json({ success: false, message: "Student not found." });

            // check mentor authorization:
            // Allow if viewing self (Mentor-as-Student) OR if they are the assigned mentor
            if (req.user.role === 'mentor') {
                const isViewingSelf = req.user._id.toString() === studentId.toString();
                const isAssignedMentor = student.mentorId?.toString() === req.user._id.toString();

                if (!isViewingSelf && !isAssignedMentor) {
                    return res.status(403).json({ success: false, message: "You are not assigned to this student." });
                }
            }

            const habits = await Habit.find({ student: studentId }).sort({ createdAt: 1 });
            return res.json({ success: true, habits });
        } catch (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = new HabitController();
