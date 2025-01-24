const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name : {
        type : String ,
        required : true
    } ,
    rollNumber : {
        type : String ,
        required : true
    } ,
    year : {
        type : Number ,
        required : true
    } ,
    branch : {
        type : String ,
        required : true
    } , 
    programme : {
        type : String , 
        required : true
    } , 
    email : {
        type : String ,
        required : true
    } ,
    phone : {
        type : String , 
        required : false
    } ,
    faceId : {
        type : String ,
        required : false
    } ,
    avatar : {
        type : String ,
        required : false ,
        get : (avatar)=> {
            if (avatar){
                return `${process.env.BASE_URL}${avatar}`
            }
            else {
                return avatar;
            }
        }
    }
} , {
    timestamps : true ,
    toJSON : {gettters : true}
});


module.exports = mongoose.model('User' , userSchema , 'users');