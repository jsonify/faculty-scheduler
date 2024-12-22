import { supabase } from '@/lib/supabase';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  try {
    console.log('Starting database migration...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../migrations/001_enhance_schema.sql'),
      'utf8'
    );

    const { error } = await supabase.from('schema').rpc('run_sql', {
      sql: migrationSQL
    });

    if (error) {
      throw error;
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();