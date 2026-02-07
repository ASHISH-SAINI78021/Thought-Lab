require("dotenv").config();
const nodemailer = require('nodemailer');

// Email Transporter Setup
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

async function testEmail() {
    console.log('Testing email configuration...');
    console.log('Email Service:', process.env.EMAIL_SERVICE);
    console.log('Email:', process.env.EMAIL);
    console.log('Email Host:', process.env.EMAIL_HOST);
    console.log('Email Port:', process.env.EMAIL_PORT);
    
    const mailOptions = {
        from: `Thought Lab <${process.env.EMAIL}>`,
        to: process.env.EMAIL, // Send to yourself for testing
        subject: 'Test Email - Thought Lab Email Service',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
                <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
                    <h2 style="color: #3a7bd5;">Email Service Test</h2>
                    <p>This is a test email from Thought Lab.</p>
                    <p>If you're receiving this, your email service is configured correctly! ✅</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #666; font-size: 14px;">
                        Sent at: ${new Date().toLocaleString()}<br>
                        From: ${process.env.EMAIL}
                    </p>
                </div>
            </div>
        `
    };

    try {
        console.log('\nAttempting to send test email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
        console.log('\n✅ EMAIL SERVICE IS WORKING CORRECTLY!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error sending email:');
        console.error('Error Message:', error.message);
        console.error('Error Code:', error.code);
        console.error('\nFull Error:', error);
        console.log('\n❌ EMAIL SERVICE IS NOT WORKING!');
        process.exit(1);
    }
}

testEmail();
