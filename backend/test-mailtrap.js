require('dotenv').config();
const emailService = require('./services/email-service');

async function testMailtrap() {
    console.log('--- Mailtrap API Test ---');
    console.log('Sender Email:', emailService.sender.email);
    
    // Test with the sender's own email for safety
    const testRecipient = 'frii78021@gmail.com'; 
    
    const result = await emailService.sendEmail({
        to: testRecipient,
        subject: 'Thought Lab - Mailtrap API Verification',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h1 style="color: #2c3e50;">Mailtrap Integration Working!</h1>
                <p>This email was sent using the <strong>Mailtrap API SDK</strong> via Render-compatible HTTPS.</p>
                <p>Sent at: ${new Date().toLocaleString()}</p>
            </div>
        `
    });

    if (result.success) {
        console.log('✅ Mailtrap test email sent successfully!');
        process.exit(0);
    } else {
        console.error('❌ Mailtrap test email failed:', result.error);
        process.exit(1);
    }
}

testMailtrap();
