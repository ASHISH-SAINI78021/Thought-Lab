const userService = require('../services/user-service.js');
const Task = require('../Models/task-model.js');
const Meditation = require('../Models/meditation-model.js');
const User = require('../Models/user-model.js');

class UserController {
    async incrementYear(req , res){
        try {
            const {rollNumber} = req.body;
            if (!rollNumber){
                return res.json({message : "Roll number is requried"});
            }
    
            const user = await userService.incrementYear({rollNumber});

            return user;
        }
        catch (err){
            console.log(err);
            return res.json(err);
        }
    }
    
    async adminDashboard(req, res){
        try {
            res.json({
                success : true,
                message : "Welcome to admin dashboard"
            });
        } catch (error) {
            console.log(error);
            return res.json({
                success : false,
                error : error.message
            })
        }
    }

    async getAllUsers(req, res) {
        try {
            const users = await userService.allUsers();
            return res.json({ success: true, users });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async assignMentor(req, res) {
        try {
            const { studentId, mentorId } = req.body;
            
            // Validate the mentor has less than 5 students
            const userModel = require('../Models/user-model.js');
            const studentCount = await userModel.countDocuments({ mentorId });
            
            if (studentCount >= 5) {
                return res.status(400).json({ success: false, message: "This mentor has reached the maximum student limit (5)." });
            }
            
            const student = await userModel.findByIdAndUpdate(studentId, { mentorId }, { new: true });
            if (!student) {
                return res.status(404).json({ success: false, message: "Student not found." });
            }
            
            return res.json({ success: true, message: "Mentor assigned successfully.", student });
        } catch (error) {
            console.error("Error assigning mentor:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async changeUserRole(req, res) {
        try {
            const { email, role } = req.body;
            if (!email || !role) {
                return res.status(400).json({ success: false, message: "Email and role are required." });
            }
            
            const User = require('../Models/user-model.js');
            const userToUpdate = await User.findOne({ email });
            
            if (!userToUpdate) {
                return res.status(404).json({ success: false, message: "User not found." });
            }

            if (userToUpdate.role === 'superAdmin' && req.user.role !== 'superAdmin') {
                return res.status(403).json({ success: false, message: "Cannot modify SuperAdmin role." });
            }

            userToUpdate.role = role;
            await userToUpdate.save();

            return res.json({ success: true, message: `User role successfully updated to ${role}.`, user: userToUpdate });
        } catch (error) {
            console.error("Error changing user role:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async updateProfile(req, res) {
        try {
            const userId = req.user._id;
            const { name, phone, email, branch, programme, year } = req.body;
            
            const updateData = {
                name,
                phone,
                email,
                branch,
                programme,
                year
            };

            if (req.file) {
                updateData.profilePicture = `storage/${req.file.filename}`;
            }

            const user = await userService.updateUser(userId, updateData);
            
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            return res.json({ success: true, message: "Profile updated successfully", user });
        } catch (error) {
            console.error("Error updating profile:", error);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    async getUserHistory(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findById(id);

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            // 1. Fetch completed/failed tasks for this user
            const tasks = await Task.find({
                assignedTo: id,
                status: { $in: ['COMPLETED', 'FAILED'] }
            }).select('title scoreReward scorePenalty status completedAt updatedAt');

            // 2. Fetch meditations for this user (with name fallback for legacy records)
            const meditations = await Meditation.find({
                $or: [
                    { user: id },
                    { 
                        $and: [
                            { user: { $exists: false } }, 
                            { name: { $regex: new RegExp("^" + user.name + "$", "i") } }
                        ] 
                    }
                ]
            }).select('details score date');

            // 3. Format and combine
            const history = [
                ...tasks.map(t => ({
                    id: t._id,
                    type: 'TASK',
                    title: t.title,
                    points: t.status === 'COMPLETED' ? t.scoreReward : -t.scorePenalty,
                    status: t.status,
                    date: t.completedAt || t.updatedAt
                })),
                ...meditations.map(m => ({
                    id: m._id,
                    type: 'MEDITATION',
                    title: m.details,
                    points: m.score,
                    status: 'COMPLETED',
                    date: m.date
                }))
            ];

            // 4. Sort by date descending
            history.sort((a, b) => new Date(b.date) - new Date(a.date));

            // 5. Pagination
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const totalRecords = history.length;
            const totalPages = Math.ceil(totalRecords / limit);
            const startIndex = (page - 1) * limit;
            const paginatedHistory = history.slice(startIndex, startIndex + limit);

            return res.json({ 
                success: true, 
                history: paginatedHistory,
                pagination: {
                    totalRecords,
                    totalPages,
                    currentPage: page,
                    limit
                }
            });
        } catch (error) {
            console.error("Error fetching user history:", error);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    /**
     * GET /mentors/available
     * Lists all mentors with their current student count and availability
     */
    async getAvailableMentors(req, res) {
        try {
            // Exclude the current user from the list (prevents self-mentoring if they are a mentor)
            const mentors = await User.find({ 
                role: 'mentor', 
                _id: { $ne: req.user._id } 
            }).select('name email rollNumber branch');
            const result = await Promise.all(mentors.map(async (mentor) => {
                const studentCount = await User.countDocuments({ mentorId: mentor._id });
                return {
                    _id: mentor._id,
                    name: mentor.name,
                    email: mentor.email,
                    rollNumber: mentor.rollNumber,
                    branch: mentor.branch,
                    studentCount,
                    isFull: studentCount >= 5,
                    spotsLeft: Math.max(0, 5 - studentCount)
                };
            }));
            return res.json({ success: true, mentors: result });
        } catch (error) {
            console.error("Error fetching available mentors:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    /**
     * POST /student/request-mentor
     * Body: { mentorId }
     * Student self-selects a mentor (must not be assigned already + mentor not full)
     */
    async requestMentor(req, res) {
        try {
            const studentId = req.user._id;
            const { mentorId } = req.body;

            if (!mentorId) {
                return res.status(400).json({ success: false, message: "mentorId is required" });
            }

            const student = await User.findById(studentId);
            if (!student) return res.status(404).json({ success: false, message: "User not found" });

            if (studentId.toString() === mentorId.toString()) {
                return res.status(400).json({ success: false, message: "You cannot be your own mentor!" });
            }

            // If they are already assigned, auto-recover the frontend state instead of failing
            if (student.mentorId) {
                return res.json({ 
                    success: true, 
                    message: "You are already assigned to a mentor!", 
                    user: student 
                });
            }

            const mentor = await User.findOne({ _id: mentorId, role: 'mentor' });
            if (!mentor) return res.status(404).json({ success: false, message: "Mentor not found." });

            const studentCount = await User.countDocuments({ mentorId });
            if (studentCount >= 5) {
                return res.status(400).json({ success: false, message: "This mentor's team is full (max 5 students)." });
            }

            student.mentorId = mentorId;
            await student.save();

            return res.json({
                success: true,
                message: `You've been added to ${mentor.name}'s team!`,
                user: student
            });
        } catch (error) {
            console.error("Error requesting mentor:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
}

module.exports = new UserController();
