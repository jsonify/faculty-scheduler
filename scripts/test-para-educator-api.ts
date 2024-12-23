// scripts/test-para-educator-api.ts
import { supabaseAdmin } from './test-setup';
import 'dotenv/config';

async function testParaEducatorAPI() {
  console.log('🧪 Starting Para-Educator API Tests...\n');
  let testData = {
    paraEducatorId: '',
    studentId: '',
    assignmentId: ''
  };

  try {
    // First, let's check the current structure
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from('employees')
      .select()
      .limit(1);
    
    console.log('Current table structure:', tableInfo);
    
    if (tableError) {
      console.error('Error checking table:', tableError);
      throw tableError;
    }

    // Test 1: Create Para-Educator
    console.log('\nTest 1: Creating Para-Educator');
    const { data: newParaEducator, error: createError } = await supabaseAdmin
      .from('employees')
      .insert([
        {
          name: 'Test Para-Educator',
          role: 'teacher', // Using 'teacher' first to test
          shift_start: '08:00',
          shift_end: '16:00'
        }
      ])
      .select()
      .single();

    if (createError) {
      console.log('Error details:', createError);
      throw createError;
    }

    testData.paraEducatorId = newParaEducator.id;
    console.log('✅ Successfully created employee:', newParaEducator);

    // Clean up
    if (testData.paraEducatorId) {
      const { error: deleteError } = await supabaseAdmin
        .from('employees')
        .delete()
        .eq('id', testData.paraEducatorId);
        
      if (deleteError) {
        console.error('Error cleaning up:', deleteError);
      } else {
        console.log('✅ Cleanup completed');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
testParaEducatorAPI();