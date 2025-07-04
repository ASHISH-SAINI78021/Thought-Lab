class UserDto {
    id;
    name;
    profilePicture;
    year;
    rollNumber;
    branch;
    role;
    email;

    constructor(user, token){
        this.id = user._id;
        this.name = user.name;
        this.profilePicture = user.profilePicture;
        this.year = user.year;
        this.rollNumber = user.rollNumber;
        this.branch = user.branch;
        this.role = user.role;
        this.token = token;
        this.email = user.email;
    }
}



module.exports = UserDto;