class UserDto {
    id;
    name;
    profilePicture;
    year;
    rollNumber;
    branch;
    role;
    email;
    mentorId;

    constructor(user, token){
        this.id = user._id;
        this._id = user._id;
        this.name = user.name;
        this.profilePicture = user.profilePicture;
        this.year = user.year;
        this.rollNumber = user.rollNumber;
        this.branch = user.branch;
        this.role = user.role;
        this.mentorId = user.mentorId;
        this.token = token;
        this.email = user.email;
    }
}



module.exports = UserDto;