require('dotenv').config();
const emailService = require('./services/email-service');

async function testEmailJS() {
    console.log('--- EmailJS Integration Test ---');
    console.log('Service ID:', process.env.EMAILJS_SERVICE_ID);
    
    // 1. Test Attendance Template
    console.log('\nTesting Attendance Template...');
    const attendanceResult = await emailService.sendAttendanceSuccessEmail(
        { name: 'Test User', email: 'frii78021@gmail.com' },
        { date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() }
    );

    if (attendanceResult.success) {
        console.log('✅ Attendance test email sent successfully!');
    } else {
        console.error('❌ Attendance test email failed:', attendanceResult.error);
    }

    // 2. Test Task Template
    console.log('\nTesting Task Template...');
    const taskResult = await emailService.sendTaskAssignmentEmail(
        { name: 'Thought Lab Student', email: 'frii78021@gmail.com' },
        { 
            title: 'Test Integration Task', 
            description: 'This is a test to verify EmailJS integration.',
            scoreReward: 50,
            scorePenalty: 25,
            deadline: new Date(Date.now() + 86400000)
        }
    );

    if (taskResult.success) {
        console.log('✅ Task test email sent successfully!');
    } else {
        console.error('❌ Task test email failed:', taskResult.error);
    }

    process.exit(attendanceResult.success && taskResult.success ? 0 : 1);
}

testEmailJS();
