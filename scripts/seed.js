const { Client } = require('pg');

async function seedInitialUsers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Note: These UUIDs should match the actual user IDs created in Supabase Auth
    // You'll need to manually create these users in Supabase Auth first, then update these IDs
    
    const seedData = `
      -- Insert initial admin and user profiles
      -- IMPORTANT: Replace these UUIDs with actual user IDs from Supabase Auth
      -- Create users in Supabase Auth dashboard first, then add their profiles here
      
      -- Example structure (uncomment and update with real UUIDs after creating users in Supabase):
      /*
      INSERT INTO profiles (id, email, full_name, role) 
      VALUES 
        ('ADMIN-USER-UUID-FROM-SUPABASE', 'admin@example.com', 'Admin User', 'admin'),
        ('REGULAR-USER-UUID-FROM-SUPABASE', 'user@example.com', 'Regular User', 'user')
      ON CONFLICT (id) DO NOTHING;
      */
    `;

    await client.query(seedData);
    console.log('✓ Seed data script completed');
    console.log('\nNOTE: Please create users in Supabase Auth first, then update this script with their UUIDs');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedInitialUsers();
