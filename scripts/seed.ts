// scripts/seed.ts
import 'dotenv/config';
import { supabase } from '@/lib/supabase';

const TEACHER_NAMES = [
 'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Kim',
 'Rachel Thompson', 'James Wilson', 'Maria Garcia', 'John Smith',
 'Lisa Patel', 'Robert Taylor', 'Jennifer Lee', 'William Brown',
 'Amanda Martinez', 'Thomas Anderson', 'Nicole White'
];

const PARA_NAMES = [
 'Alex Rivera', 'Jordan Smith', 'Casey Jones', 
 'Pat Wilson', 'Sam Taylor'
];

const STUDENT_NAMES = [
 'Emma Thompson', 'Liam Johnson', 'Sophia Garcia',
 'Noah Martinez', 'Olivia Wilson'
];

const BREAK_TYPES = [
 { name: 'Lunch', duration: 30 },
 { name: 'Morning Break', duration: 15 },
 { name: 'Afternoon Break', duration: 15 }
];

function generateMockUUID() {
 return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
   const r = (Math.random() * 16) | 0;
   const v = c === "x" ? r : (r & 0x3) | 0x8;
   return v.toString(16);
 });
}

async function seedParaEducatorData() {
 const { error: breakTypesError } = await supabase
   .from('break_types')
   .insert(BREAK_TYPES);

 if (breakTypesError) throw breakTypesError;

 const paraData = PARA_NAMES.map(name => ({
   id: generateMockUUID(),
   name,
   is_available: true,
   daily_capacity: 8,
   shift_start: '08:00',
   shift_end: '16:00'
 }));

 const { data: paras, error: paraError } = await supabase
   .from('para_educators')
   .insert(paraData)
   .select();

 if (paraError) throw paraError;

 const studentData = STUDENT_NAMES.map(name => ({
   id: generateMockUUID(),
   name,
   grade: Math.floor(Math.random() * 5) + 6 // Grades 6-10
 }));

 const { data: students, error: studentError } = await supabase
   .from('students')
   .insert(studentData)
   .select();

 if (studentError) throw studentError;

 const supportData = students?.map((student, index) => ({
   student_id: student.id,
   para_id: paras?.[index % paras.length].id,
   support_level: Math.floor(Math.random() * 3) + 1,
   start_time: '08:00',
   end_time: '15:00',
   date: new Date().toISOString().split('T')[0]
 }));

 const { error: supportError } = await supabase
   .from('support_requirements')
   .insert(supportData);

 if (supportError) throw supportError;
}

async function seedDatabase() {
 try {
   console.log('Clearing existing data...');
   await supabase.from('support_requirements').delete().neq('id', 'none');
   await supabase.from('students').delete().neq('id', 'none');
   await supabase.from('para_educators').delete().neq('id', 'none');
   await supabase.from('break_types').delete().neq('id', 'none');
   await supabase.from('shifts').delete().neq('id', 'none');
   await supabase.from('teachers').delete().neq('id', 'none');

   await seedParaEducatorData();
   console.log('Para-educator data seeded successfully');

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

   console.log('Creating shifts...');
   const today = new Date().toISOString().split('T')[0];
   
   const shifts = teachers?.map((teacher, index) => {
     const startHour = 8 + (index % 3);
     const endHour = startHour + 8;
     
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