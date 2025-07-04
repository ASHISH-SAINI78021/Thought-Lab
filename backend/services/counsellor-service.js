const Appointment = require("../Models/counsellor-model.js");

class CounsellorService {
    async createAppointment(body){
        const appointment = new Appointment(body);
        await appointment.save();

        return appointment;
    }

    async approveAppointment(id){
        const appointment = await Appointment.findByIdAndUpdate(id , {status: 'Approved'} , {new : true});

        return appointment;
    }

    async rejectAppointment(id){
        const appointment = await Appointment.findByIdAndUpdate(id , {status: 'Rejected'} , {new : true});

        return appointment;
    }

    async getAppointments(){
        const appointments = await Appointment.find().sort({createdAt : -1});

        return appointments;
    }
}

module.exports = new CounsellorService();