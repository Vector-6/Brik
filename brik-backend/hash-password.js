/**
 * Password Hashing Utility
 * 
 * Usage: node hash-password.js <password>
 * 
 * This script generates a bcrypt hash for your admin password.
 * Use the generated hash in your .env file as ADMIN_PASSWORD_HASH
 */

const bcrypt = require('bcrypt');

async function hashPassword() {
  const password = process.argv[2];
  
  if (!password) {
    console.error('❌ Error: Password is required');
    console.log('\nUsage:');
    console.log('  node hash-password.js <password>');
    console.log('\nExample:');
    console.log('  node hash-password.js "mySecurePassword123"');
    process.exit(1);
  }
  
  if (password.length < 6) {
    console.warn('⚠️  Warning: Password is shorter than 6 characters');
  }
  
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log('\n✅ Password hashed successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Add this to your .env file:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`ADMIN_PASSWORD_HASH=${hash}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  Keep this hash secure and never commit it to git!\n');
  } catch (error) {
    console.error('❌ Error hashing password:', error.message);
    process.exit(1);
  }
}

hashPassword();
