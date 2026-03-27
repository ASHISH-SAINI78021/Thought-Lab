const userService = require('../services/user-service.js');

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
}


module.exports = new UserController();