// scripts/seed.ts
import 'dotenv/config';
import { supabase } from '@/lib/supabase';
import { MOCK_EMPLOYEES } from '@/lib/mock-data';

async function seedDatabase() {
  try {
    // First clear existing data
    console.log('Clearing existing data...');
    await supabase.from('shifts').delete().neq('id', 'none');
    await supabase.from('teachers').delete().neq('id', 'none');

    // Insert teachers
    console.log('Inserting teachers...');
    const { data: teachers, error: teacherError } = await supabase
      .from('teachers')
      .insert(
        MOCK_EMPLOYEES.map(employee => ({
          id: employee.id,
          name: employee.name,
          role: employee.role
        }))
      )
      .select();

    if (teacherError) {
      console.error('Error inserting teachers:', teacherError);
      throw teacherError;
    }

    console.log('Successfully seeded teachers:', teachers?.length);

    // Create some example shifts for each teacher
    console.log('Creating shifts...');
    const shifts = teachers?.flatMap(teacher => {
      const today = new Date();
      return Array.from({ length: 3 }, (_, i) => ({
        teacher_id: teacher.id,  // Using teacher_id to match schema
        date: new Date(today.setDate(today.getDate() + i)).toISOString().split('T')[0],
        start_time: '08:00',
        end_time: '16:00'
      }));
    }) || [];

    if (shifts.length > 0) {
      const { data: createdShifts, error: shiftsError } = await supabase
        .from('shifts')
        .insert(shifts)
        .select();

      if (shiftsError) {
        console.error('Error inserting shifts:', shiftsError);
        throw shiftsError;
      }

      console.log('Successfully seeded shifts:', createdShifts?.length);
    }

    process.exit(0);
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();