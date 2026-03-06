require('dotenv').config();
const emailService = require('./services/email-service');

async function testEmail() {
    console.log('--- Resend Verification Test ---');
    console.log('From Email:', emailService.fromEmail);
    
    const testRecipient = 'frii78021@gmail.com'; // Using user's email from .env as a safe test
    
    const result = await emailService.sendEmail({
        to: testRecipient,
        subject: 'Thought Lab - Verification Test',
        html: `
            <h1>Verification Test Successful</h1>
            <p>This email was sent using the verified domain <strong>nitkkr.ac.in</strong> via Resend.</p>
            <p>Sent at: ${new Date().toLocaleString()}</p>
        `
    });

    if (result.success) {
        console.log('✅ Test email sent successfully!');
        process.exit(0);
    } else {
        console.error('❌ Test email failed:', result.error);
        process.exit(1);
    }
}

testEmail();
