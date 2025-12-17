const postgres = require('postgres');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createInitialAdmin() {
  const sql = postgres(process.env.DATABASE_URL);

  try {
    console.log('Connected to database\n');

    console.log('This script will help you create an initial admin user.');
    console.log('First, register the user via the web UI at http://localhost:3000/register');
    console.log('Then come back here and enter their email to promote them to admin.\n');

    const email = await question('Enter the email address of the user to make admin: ');

    if (!email || !email.includes('@')) {
      console.log('Invalid email address');
      process.exit(1);
    }

    const result = await sql`
      UPDATE profiles SET role = 'admin' WHERE email = ${email} RETURNING *
    `;

    if (result.length === 0) {
      console.log(`\n❌ No user found with email: ${email}`);
      console.log('Make sure the user has registered first via the web UI.');
    } else {
      console.log(`\n✅ Successfully promoted ${email} to admin!`);
      console.log('\nUser details:');
      console.log(`- Email: ${result[0].email}`);
      console.log(`- Name: ${result[0].full_name || 'Not set'}`);
      console.log(`- Role: ${result[0].role}`);
      console.log('\nYou can now log in as admin at http://localhost:3000/login');
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
    rl.close();
  }
}

createInitialAdmin();
