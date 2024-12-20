// scripts/test-data-access.ts

import 'dotenv/config';
import { getEmployees, updateEmployeeSchedule } from '../lib/data/schedule-data';

async function testDataAccess() {
  console.log('Testing Data Access Layer...\n');

  // Test getEmployees
  console.log('Testing getEmployees...');
  const { data: employees, error: employeesError } = await getEmployees();
  
  if (employeesError) {
    console.error('❌ getEmployees failed:', employeesError);
  } else {
    console.log('✅ getEmployees succeeded');
    console.log(`Retrieved ${employees?.length} employees`);
    console.log('Sample employee:', employees?.[0]);
  }

  // Test updateEmployeeSchedule
  if (employees?.length) {
    console.log('\nTesting updateEmployeeSchedule...');
    const testEmployee = employees[0];
    const today = new Date().toISOString().split('T')[0];
    
    const { success, error: updateError } = await updateEmployeeSchedule(
      testEmployee.id,
      today,
      '09:00',
      '17:00'
    );

    if (updateError) {
      console.error('❌ updateEmployeeSchedule failed:', updateError);
    } else {
      console.log('✅ updateEmployeeSchedule succeeded');
    }
  }
}

testDataAccess().catch(console.error);