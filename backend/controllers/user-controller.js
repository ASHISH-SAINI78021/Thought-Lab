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
}


module.exports = new UserController();