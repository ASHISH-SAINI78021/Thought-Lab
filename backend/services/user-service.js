const UserModel = require('../Models/user-model.js');

class UserService {
    async findUser(filter){
        const user = await UserModel.findOne(filter);
        return user;
    }
    async createUser(data){
        const user = await UserModel.create(data);
        return user;
    }
    async incrementYear(filter){
        const user = await UserModel.findOneAndUpdate(filter , {$inc : {year : 1}} , {new  : true});
        
        return user;
    }
    async allUsers(){
        const users = await UserModel.find();
        
        return users;
    }
}


module.exports = new UserService();