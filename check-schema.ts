// check-schema.ts
import { supabase } from '@/lib/supabase';

async function checkSchema() {
  try {
    // First, let's check the shifts table structure
    const { data: shiftsInfo, error: shiftsError } = await supabase
      .from('shifts')
      .select('*')
      .limit(1);

    if (shiftsError) {
      console.error('Error checking shifts table:', shiftsError);
    } else {
      console.log('Shifts table columns:', Object.keys(shiftsInfo[0] || {}));
    }

    // Let's also check if the table exists and its definition
    const { data: tables, error: tablesError } = await supabase
      .rpc('schema_info')
      .select('*');

    if (tablesError) {
      console.error('Error checking tables:', tablesError);
    } else {
      console.log('Database tables:', tables);
    }

  } catch (error) {
    console.error('Error checking schema:', error);
  }
}

checkSchema();