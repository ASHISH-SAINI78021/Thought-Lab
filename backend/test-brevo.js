require('dotenv').config();
const emailService = require('./services/email-service');

async function testBrevo() {
    console.log('--- Brevo API Test ---');
    console.log('Sender Email:', emailService.sender.email);
    
    // Test with the sender's own email for safety
    const testRecipient = 'frii78021@gmail.com'; 
    
    const result = await emailService.sendEmail({
        to: testRecipient,
        subject: 'Thought Lab - Brevo API Verification',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h1 style="color: #3d4ed1;">Brevo Integration Working!</h1>
                <p>This email was sent using the <strong>Brevo API SDK</strong>.</p>
                <p>It works perfectly on <strong>Render</strong> and <strong>Vercel</strong> because it uses HTTPS.</p>
                <hr>
                <p>Sent at: ${new Date().toLocaleString()}</p>
            </div>
        `
    });

    if (result.success) {
        console.log('✅ Brevo test email sent successfully!');
        process.exit(0);
    } else {
        console.error('❌ Brevo test email failed:', result.error);
        process.exit(1);
    }
}

testBrevo();
