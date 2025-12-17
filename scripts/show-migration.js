import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#][^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    process.env[key] = value;
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdWZkanRwbW10cWVqdmx6ZGhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4Njk3NjAsImV4cCI6MjA4MTQ0NTc2MH0.dkd8hdDvMaX4o92tsVr5PtkTrbIC1QIZW05WuAaLYDg';

console.log('📋 Supabase Migration Instructions\n');
console.log('Since direct database connections are having DNS issues, please run the migration SQL manually:\n');
console.log('1. Go to your Supabase Dashboard: https://ukufdjtpmmtqejvlzdhg.supabase.co');
console.log('2. Click on "SQL Editor" in the left sidebar');
console.log('3. Click "New Query"');
console.log('4. Copy and paste the SQL from: migrations/001_initial_schema.sql');
console.log('5. Click "Run" to execute the migration\n');

console.log('Alternatively, here\'s the SQL to copy:\n');
console.log('─'.repeat(80));
const migrationPath = join(__dirname, '..', 'migrations', '001_initial_schema.sql');
const migrationSQL = readFileSync(migrationPath, 'utf-8');
console.log(migrationSQL);
console.log('─'.repeat(80));
console.log('\n✅ After running the SQL in Supabase dashboard, your database will be ready!');
