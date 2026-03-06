const emailjs = require('@emailjs/nodejs');

class EmailService {
    constructor() {
        this.serviceId = process.env.EMAILJS_SERVICE_ID;
        this.publicKey = process.env.EMAILJS_PUBLIC_KEY;
        this.privateKey = process.env.EMAILJS_PRIVATE_KEY;
        this.templates = {
            attendance: process.env.EMAILJS_TEMPLATE_ATTENDANCE,
            task: process.env.EMAILJS_TEMPLATE_TASK,
        };

        emailjs.init({
            publicKey: this.publicKey,
            privateKey: this.privateKey,
        });
    }

    /**
     * Generic send method for EmailJS templates
     */
    async sendWithTemplate(templateId, templateParams) {
        try {
            console.log(`📤 EmailJS Template Params:`, { to_email: templateParams.to_email, subject: templateParams.subject });
            const result = await emailjs.send(
                this.serviceId,
                templateId,
                templateParams
            );
            console.log(`✅ Email sent successfully via EmailJS. Status: ${result.status}`);
            return { success: true };
        } catch (error) {
            console.error('❌ EmailJS Error:', error);
            return { success: false, error };
        }
    }

    /**
     * Compatibility method for direct HTML emails (Note: EmailJS doesn't support raw HTML injection
     * unless the template has a variable for it. This now uses the Task template as a fallback).
     */
    async sendEmail({ to, subject, html }) {
        console.log(`📡 Attempting to send dynamic email to ${to} using fallback template...`);
        return this.sendWithTemplate(this.templates.task, {
            to_email: to,
            email: to, // Redundant for compatibility
            subject: subject,
            message_html: html,
            message: html.replace(/<[^>]*>?/gm, ''), // Plain text fallback
            user_name: to.split('@')[0],
            to_name: to.split('@')[0],
            task_title: subject,
            task_description: "General Notification",
            score_reward: "N/A",
            deadline: "N/A"
        });
    }

    async sendAttendanceSuccessEmail(user, attendanceDetails) {
        const subject = `✅ Attendance Marked - ${user.name}`;
        const message_html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #059669;">Attendance Recorded</h2>
                <p>Hello <strong>${user.name}</strong>,</p>
                <p>Your attendance has been successfully marked for today.</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Date:</strong> ${attendanceDetails.date}</p>
                    <p><strong>Time:</strong> ${attendanceDetails.time}</p>
                    <p><strong>Points Earned:</strong> <span style="color: #059669; font-weight: bold;">+10</span></p>
                </div>
                <p>Thank you for being regular!</p>
            </div>
        `;

        return this.sendWithTemplate(this.templates.attendance, {
            to_email: user.email,
            email: user.email,
            user_name: user.name,
            to_name: user.name,
            date: attendanceDetails.date,
            time: attendanceDetails.time,
            score: "10",
            subject: subject,
            message_html: message_html,
            message: `Attendance marked on ${attendanceDetails.date} at ${attendanceDetails.time}. Points earned: 10.`
        });
    }

    async sendAttendanceFailureEmail(user, reason) {
        // Falling back to sending raw HTML via the Task template if a Failure template wasn't provided
        return this.sendEmail({
            to: user.email,
            subject: '❌ Attendance Marking Failed',
            html: `Reason: ${reason}. Please try again.`
        });
    }

    async sendTaskAssignmentEmail(user, task) {
        console.log(`📧 Sending Task Assignment email to: ${user.email} (Name: ${user.name})`);
        if (!user.email) {
            console.error('❌ Cannot send email: User has no email address.');
            return { success: false, error: 'User email missing' };
        }

        const deadline = new Date(task.deadline).toLocaleDateString();
        const subject = `🚀 New Task Assigned: ${task.title}`;
        const message_html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #4f46e5;">New Task: ${task.title}</h2>
                <p>Hello <strong>${user.name}</strong>,</p>
                <p>You have been assigned a new task on Thought Lab.</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Description:</strong> ${task.description}</p>
                    <p><strong>Reward Points:</strong> <span style="color: #059669; font-weight: bold;">+${task.scoreReward}</span></p>
                    <p><strong>Penalty Points:</strong> <span style="color: #dc2626; font-weight: bold;">-${task.scorePenalty}</span></p>
                    <p><strong>Deadline:</strong> ${deadline}</p>
                </div>
                <p>Please log in to your dashboard to view more details and start working.</p>
                <a href="https://thought-labv2.netlify.app/task-dashboard" style="display: inline-block; background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Go to Task Dashboard</a>
            </div>
        `;

        return this.sendWithTemplate(this.templates.task, {
            to_email: user.email,
            email: user.email,
            user_name: user.name,
            to_name: user.name,
            subject: subject,
            task_title: task.title,
            task_description: task.description,
            score_reward: task.scoreReward,
            score_penalty: task.scorePenalty,
            score: task.scoreReward,
            deadline: deadline,
            message_html: message_html,
            message: `Task: ${task.title}. Reward: ${task.scoreReward}. Penalty: ${task.scorePenalty}. Deadline: ${deadline}`,
            task_link: "https://thought-labv2.netlify.app/task-dashboard"
        });
    }

    async sendTaskCompletionEmail(user, task) {
        console.log(`📧 Sending Task Completion email to: ${user.email} (Task: ${task.title})`);
        const subject = `✅ Task Completed: ${task.title}`;
        const message_html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #059669;">Congratulations!</h2>
                <p>Hello <strong>${user.name}</strong>,</p>
                <p>Your task <strong>${task.title}</strong> has been marked as completed.</p>
                <p style="font-size: 18px;">You earned <strong style="color: #059669;">${task.scoreReward}</strong> points!</p>
                <p>Your score has been updated in the leaderboard.</p>
            </div>
        `;

        return this.sendWithTemplate(this.templates.task, {
            to_email: user.email,
            email: user.email,
            user_name: user.name,
            to_name: user.name,
            subject: subject,
            task_title: task.title,
            score_reward: task.scoreReward,
            score: task.scoreReward,
            message_html: message_html,
            message: `Congratulations! Your task "${task.title}" is completed. You earned ${task.scoreReward} points.`
        });
    }

    async sendTaskFailureEmail(user, task) {
        console.log(`📧 Sending Task Failure email to: ${user.email} (Task: ${task.title})`);
        const subject = `❌ Task Failed: ${task.title}`;
        const message_html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #dc2626;">Task Notification</h2>
                <p>Hello <strong>${user.name}</strong>,</p>
                <p>Unfortunately, the task <strong>${task.title}</strong> was not completed within the requirements.</p>
                <p style="font-size: 18px;">A penalty of <strong style="color: #dc2626;">${task.scorePenalty}</strong> points has been applied.</p>
                <p>Keep working hard for the next tasks!</p>
            </div>
        `;

        return this.sendWithTemplate(this.templates.task, {
            to_email: user.email,
            email: user.email,
            user_name: user.name,
            to_name: user.name,
            subject: subject,
            task_title: task.title,
            score_penalty: task.scorePenalty,
            score: `-${task.scorePenalty}`,
            message_html: message_html,
            message: `The task "${task.title}" was marked as failed. Deduction: ${task.scorePenalty} points.`
        });
    }

    async sendApprovalEmail(appointment) {
        return this.sendEmail({
            to: appointment.email,
            subject: 'Your Thought Lab Session Confirmation',
            html: `Confirmed for ${appointment.preferredDate} at ${appointment.preferredTime}`
        });
    }

    async sendRejectionEmail(appointment) {
        return this.sendEmail({
            to: appointment.email,
            subject: 'Your Appointment Request Status',
            html: `Unfortunately, we cannot accommodate your request at this time.`
        });
    }

    async sendAdminPromotionEmail(user) {
        console.log(`📧 Sending Admin Promotion email to: ${user.email}`);
        return this.sendEmail({
            to: user.email,
            email: user.email,
            user_name: user.name,
            to_name: user.name,
            subject: 'Your Access Level Has Been Updated',
            html: `Congratulations ${user.name}, you are now an Admin.`
        });
    }
}

module.exports = new EmailService();