// scripts/seed.ts
import 'dotenv/config';
import { supabase } from '@/lib/supabase';

// Array of realistic teacher names
const TEACHER_NAMES = [
  'Sarah Johnson',
  'Michael Chen',
  'Emily Rodriguez',
  'David Kim',
  'Rachel Thompson',
  'James Wilson',
  'Maria Garcia',
  'John Smith',
  'Lisa Patel',
  'Robert Taylor',
  'Jennifer Lee',
  'William Brown',
  'Amanda Martinez',
  'Thomas Anderson',
  'Nicole White'
];

function generateMockUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function seedDatabase() {
  try {
    // First clear existing data
    console.log('Clearing existing data...');
    await supabase.from('shifts').delete().neq('id', 'none');
    await supabase.from('teachers').delete().neq('id', 'none');

    // Create teachers with unique names
    console.log('Inserting teachers...');
    const teachersData = TEACHER_NAMES.map(name => ({
      id: generateMockUUID(),
      name: name,
      role: 'Teacher'
    }));

    const { data: teachers, error: teacherError } = await supabase
      .from('teachers')
      .insert(teachersData)
      .select();

    if (teacherError) {
      console.error('Error inserting teachers:', teacherError);
      throw teacherError;
    }

    console.log('Successfully seeded teachers:', teachers?.length);

    // Create today's shifts for each teacher
    console.log('Creating shifts...');
    const today = new Date().toISOString().split('T')[0];
    
    // Create shifts with staggered start times
    const shifts = teachers?.map((teacher, index) => {
      // Stagger start times between 8 AM and 10 AM
      const startHour = 8 + (index % 3); // Will give us 8, 9, or 10
      const endHour = startHour + 8; // 8-hour shifts
      
      return {
        teacher_id: teacher.id,
        date: today,
        start_time: `${startHour.toString().padStart(2, '0')}:00`,
        end_time: `${endHour.toString().padStart(2, '0')}:00`
      };
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

    console.log('Database seeding completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();