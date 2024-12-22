import 'dotenv/config';
import { supabase } from '@/lib/supabase';

async function checkTables() {
  try {
    // Get table columns for each table
    const tables = ['employees', 'shifts', 'schedules'];
    
    for (const table of tables) {
      console.log(`\nChecking columns for ${table}:`);
      const { data, error } = await supabase.rpc('get_table_info', {
        table_name: table
      });
      
      if (error) throw error;
      console.log(data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTables();