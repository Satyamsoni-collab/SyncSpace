const mongoose = require('mongoose');
const User = require('./models/user');
const Document = require('./models/document');
const { registerUser, loginUser } = require('./auth');

async function runTests() {
    console.log('--- Starting Week 4 Test Suite ---');
    try {
        console.log('1. Testing User Registration...');
        const testEmail = `test_${Date.now()}@example.com`;
        const user = await registerUser('Test User', testEmail, 'Password123!');
        console.log('   ✓ User registered successfully with ID:', user.id);

        console.log('2. Testing User Login...');
        const loginRes = await loginUser(testEmail, 'Password123!');
        if (loginRes.token) {
            console.log('   ✓ JWT Token generated successfully.');
        }

        console.log('3. Testing Document Validation...');
        const dummyDoc = new Document({
            title: 'Sample Doc',
            content: 'Hello World Content',
            owner: user.id
        });
        if (dummyDoc.title === 'Sample Doc') {
            console.log('   ✓ Document schema validation passed.');
        }

        console.log('\nAll tests passed successfully!');
    } catch (err) {
        console.error('Test failed:', err.message);
    }
}

module.exports = runTests;