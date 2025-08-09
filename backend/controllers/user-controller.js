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
}


module.exports = new UserController();