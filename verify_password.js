const bcrypt = require('bcryptjs');

const testHash = '$2b$10$8M7EpTujh7gVTdXfie0hBuiqERC7gwp.80OB6ff.W2DNTMGf0xvJi';

// Test common passwords
const testPasswords = [
    'admin123', // Default admin password
    'Password123!',
    'Test123!',
    'BookOrbit123!',
    'Library123!',
    'Reader123!',
    'User123!',
    'Welcome123!',
    'Passw0rd!',
    'Test@123',
    'Password@123',
    'Admin@123',
    'User@123',
    'Book@123',
    'Library@123',
    'Reader@123'
];

async function verifyPassword() {
    for (const password of testPasswords) {
        const isMatch = await bcrypt.compare(password, testHash);
        if (isMatch) {
            console.log(`Found matching password: ${password}`);
            return;
        }
    }
    console.log('No matching password found in the test set');
}

verifyPassword(); 