const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    name : {type : String , required : true},
    email : {type : String , required : true},
    phone : {type : String , required : true},
    preferredDate : {type : Date , required : true},
    preferredTime : {type : String , required : true},
    concerns : {type : String , required : true},
    sessionType : {
        type : String,
        enum : ['General Counselling' , 'Meditation Guidance' , 'Chakra Balancing' , 'Life Purpose'],
        default : 'General Counselling'
    },
    status : {
        type : String,
        enum : ['Pending' , 'Approved' , 'Rejected'],
        default : 'Pending'
    },
    createdAt : {type : Date, default : Date.now}
});

const Appointment = mongoose.model('Appointment' , appointmentSchema);
module.exports = Appointment;