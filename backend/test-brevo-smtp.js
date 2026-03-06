const nodemailer = require('nodemailer');
require('dotenv').config();

async function testBrevoSMTP() {
    console.log('--- Brevo SMTP Test ---');
    
    // Create transporter using Brevo SMTP details
    // Note: API Key is used as the PASSWORD for the SMTP server
    const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false, // true for 465, false for 587
        auth: {
            user: process.env.BREVO_SENDER_EMAIL,
            pass: process.env.BREVO_API_KEY, 
        },
    });

    const mailOptions = {
        from: `Thought Lab <${process.env.BREVO_SENDER_EMAIL}>`,
        to: 'frii78021@gmail.com',
        subject: 'Thought Lab - Brevo SMTP Verification',
        text: 'This is a test email sent via Brevo SMTP relay.',
        html: '<h1>Brevo SMTP Working!</h1><p>Sent at: ' + new Date().toLocaleString() + '</p>'
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ SMTP Email sent successfully!');
        console.log('Message ID:', info.messageId);
        process.exit(0);
    } catch (error) {
        console.error('❌ SMTP Test failed:', error);
        process.exit(1);
    }
}

testBrevoSMTP();
