const CounsellorService = require('../services/counsellor-service.js');
const EmailService = require('../services/email-service.js');

class CounsellorController {
    async createAppointment(req , res){
        try {
            const {name , email , phone , preferredTime , concerns , sessionType } = req.body;

            if (!name || !email || !phone || !preferredTime || !concerns || !sessionType){
                console.log("All fields are required");
                return res.json({
                    success : false,
                    message : "All fields are required"
                });
            }
            const appointment = await CounsellorService.createAppointment(req.body);

            if (!appointment){
                return res.json({
                    success : false,
                    message : "Appointment is not created"
                });
            }

            return res.json({
                success : false,
                message : "Appointment registered successfully"
            });
        } catch (error) {
            console.log(error);
            return res.json({
                success : false,
                error
            });
        }
    } 



    async approveAppointment(req , res){
        try {
            const {id} = req.params;
            const appointment = await CounsellorService.approveAppointment(id);


            await EmailService.sendApprovalEmail(appointment);

            return res.json({
                success : true,
                message : "Appointment has been approved"
            })
        } catch (error) {
            console.log(error);
            return res.json({
                success : false,
                error
            });
        }
    }

    async rejectAppointment(req , res){
        try {
            const {id} = req.params;
            const appointment = await CounsellorService.rejectAppointment(id);


            await EmailService.sendRejectionEmail(appointment);

            return res.json({
                success : true,
                message : "Appointment has been rejected"
            })
        } catch (error) {
            console.log(error);
            return res.json({
                success : false,
                error
            });
        }
    }

    async getAppointments(req  , res){
        try {
            const appointments = await CounsellorService.getAppointments();

            if (!appointments.length){
                console.log("No appointments yet");
                return res.json({
                    success : false,
                    message : "No appointments registered yet"
                });
            }

            return res.json({
                success : true,
                appointments
            })
        } catch (error) {
            
        }
    }        
}


module.exports = new CounsellorController();