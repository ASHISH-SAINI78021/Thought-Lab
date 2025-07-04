const nodemailer = require('nodemailer');

// Email Transporter Setup
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    port : process.env.EMAIL_PORT,
    secure : false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
});

class EmailService {
  async sendApprovalEmail(appointment) {
    const mailOptions = {
      from: 'Thought Lab <thoughtlab@example.com>',
      to: appointment.email,
      subject: 'Your Thought Lab Session Confirmation',
      html: `
        <div style="
          font-family: 'Helvetica Neue', Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 0;
          background: #f9f9f9;
          border-radius: 8px;
          overflow: hidden;
        ">
          <!-- Email Header -->
          <div style="
            background: linear-gradient(135deg, #3a7bd5, #00d2ff);
            padding: 30px;
            text-align: center;
            color: white;
          ">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="white" style="margin-bottom: 15px;">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
            <h1 style="margin: 0; font-size: 24px;">Your Session Is Confirmed</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">We're honored to be part of your journey</p>
          </div>
  
          <!-- Email Body -->
          <div style="padding: 30px;">
            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6;">
              Dear ${appointment.name},
            </p>
  
            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6;">
              Your healing session with Thought Lab has been confirmed. Below are the details:
            </p>
  
            <div style="
              background: white;
              border-radius: 6px;
              padding: 20px;
              margin-bottom: 25px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            ">
              <div style="display: flex; margin-bottom: 12px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#3a7bd5" style="margin-right: 10px;">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
                </svg>
                <span style="font-weight: 500;">${new Date(appointment.preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
  
              <div style="display: flex; margin-bottom: 12px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#3a7bd5" style="margin-right: 10px;">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                <span style="font-weight: 500;">${appointment.preferredTime}</span>
              </div>
  
              <div style="display: flex;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#3a7bd5" style="margin-right: 10px;">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
                <span style="font-weight: 500;">${appointment.sessionType} Session</span>
              </div>
            </div>
  
            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6;">
              Please arrive 10 minutes before your scheduled time. If you need to reschedule or cancel, kindly give us at least 24 hours notice.
            </p>
  
            <div style="
              background: #f0f7ff;
              border-left: 3px solid #3a7bd5;
              padding: 15px;
              margin: 25px 0;
              border-radius: 0 4px 4px 0;
            ">
              <p style="margin: 0; font-weight: 500; color: #2c3e50;">Preparation Tip:</p>
              <p style="margin: 8px 0 0; color: #2c3e50;">
                Consider bringing a journal to document insights from your session. Wear comfortable clothing that allows for easy breathing.
              </p>
            </div>
  
            <div style="text-align: center; margin: 30px 0 20px;">
              
            </div>
          </div>
  
          <!-- Email Footer -->
          <div style="
            background: #2c3e50;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 14px;
          ">
            <p style="margin: 0 0 10px;">With care and compassion,</p>
            <p style="margin: 0; font-weight: 500;">The Thought Lab Team</p>
            <p style="margin: 15px 0 0;">
            
            </p>
          </div>
        </div>
      `
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Approval email sent to ${appointment.email}`);
    } catch (error) {
      console.error('Error sending approval email:', error);
      throw new Error('Failed to send approval email');
    }
  }

    async sendRejectionEmail(appointment) {
      const mailOptions = {
        from: 'Thought Lab <thoughtlab@example.com>',
        to: appointment.email,
        subject: 'Your Appointment Request Status',
        html: `
          <div style="
            font-family: 'Helvetica Neue', Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 8px;
            border-top: 4px solid #ff4757;
          ">
            <div style="text-align: center; margin-bottom: 20px;">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="#ff4757" style="margin-bottom: 15px;">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <h2 style="color: #333; margin: 0;">Appointment Not Available</h2>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
              <p style="margin: 0 0 15px;">Dear ${appointment.name},</p>
              
              <p style="margin: 0 0 15px;">
                We regret to inform you that we're unable to accommodate your requested session at this time.
              </p>
              
              <div style="background: #fff8f8; border-left: 3px solid #ff4757; padding: 10px 15px; margin: 15px 0;">
                <p style="margin: 5px 0; color: #555;">
                  <strong>Request Details:</strong><br>
                  ${new Date(appointment.preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
                  At ${appointment.preferredTime}<br>
                  Session: ${appointment.sessionType}
                </p>
              </div>
              
              <p style="margin: 15px 0;">
                We sincerely appreciate your interest in Thought Lab and regret any inconvenience this may cause.
              </p>
              
              <p style="margin: 15px 0 0;">
                You're welcome to submit a new request for a different date/time, or explore our <a href="/resources" style="color: #3a7bd5;">self-guided resources</a>.
              </p>
            </div>
            
            <div style="text-align: center; color: #777; font-size: 14px;">
              <p style="margin: 5px 0;">With care,</p>
              <p style="margin: 5px 0; font-weight: 600;">The Thought Lab Team</p>
              <p style="margin: 15px 0 0;">
              </p>
            </div>
          </div>
        `
      };
    
      try {
        await transporter.sendMail(mailOptions);
        console.log(`Rejection email sent to ${appointment.email}`);
      } catch (error) {
        console.error('Error sending rejection email:', error);
        throw new Error('Failed to send rejection email');
      }
    }
}


module.exports = new EmailService();