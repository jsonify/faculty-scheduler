import 'dotenv/config';
import { supabase } from '@/lib/supabase';

async function checkRelationships() {
  try {
    // Check foreign key relationships for para_educators
    console.log('\nChecking para_educators relationships...');
    const { data: paraFks, error: paraError } = await supabase.rpc('get_foreign_keys', {
      table_name: 'para_educators'
    });
    console.log('Para-educators foreign keys:', paraFks || 'No foreign keys found');
    if (paraError) console.error('Error:', paraError);

    // Check foreign key relationships for student_schedules
    console.log('\nChecking student_schedules relationships...');
    const { data: scheduleFks, error: scheduleError } = await supabase.rpc('get_foreign_keys', {
      table_name: 'student_schedules'
    });
    console.log('Student schedules foreign keys:', scheduleFks || 'No foreign keys found');
    if (scheduleError) console.error('Error:', scheduleError);

    // Check foreign key relationships for support_requirements
    console.log('\nChecking support_requirements relationships...');
    const { data: supportFks, error: supportError } = await supabase.rpc('get_foreign_keys', {
      table_name: 'support_requirements'
    });
    console.log('Support requirements foreign keys:', supportFks || 'No foreign keys found');
    if (supportError) console.error('Error:', supportError);

  } catch (error) {
    console.error('Error checking relationships:', error);
  }
}

// Run the check
checkRelationships();