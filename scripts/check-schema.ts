import { supabase } from '@/lib/supabase';

async function checkSchema() {
  try {
    // Verify para-educator related tables
    const tables = ['para_educators', 'students', 'student_schedules', 'support_requirements', 'break_types'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      console.log(`\nChecking table: ${table}`);
      if (error) {
        console.error(`Error: Table ${table} not found or inaccessible:`, error.message);
      } else {
        console.log(`✓ Table ${table} exists`);
        console.log('Columns:', Object.keys(data[0] || {}));
      }
    }

    // Check foreign key relationships
    const { data: foreignKeys, error: fkError } = await supabase
      .rpc('get_foreign_keys');

    if (fkError) {
      console.error('Error checking foreign keys:', fkError);
    } else {
      console.log('\nForeign key relationships:', foreignKeys);
    }

  } catch (error) {
    console.error('Schema verification failed:', error);
    process.exit(1);
  }
}

checkSchema();