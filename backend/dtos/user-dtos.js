class UserDto {
    id;
    phone;
    activated;
    createdAt;
    name;
    avatar;
    year;
    rollNumber;
    branch;

    constructor(user){
        this.id = user._id;
        this.phone = user.phone;
        this.activated = user.activated;
        this.createdAt = user.createdAt;
        this.name = user.name;
        this.avatar = user.avatar;
    }
}



module.exports = UserDto;