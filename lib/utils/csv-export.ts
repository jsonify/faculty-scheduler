// lib/utils/csv-export.ts

import { supabase } from '@/lib/supabase';
import { CSV_HEADERS } from '../constants/csv-templates';

// Employee template structure for imports
const TEMPLATE_HEADERS = [
  'name',
  'email',
  'role',
  'schedule_type',
  'start_time',
  'end_time',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday'
];

const SAMPLE_DATA = [
  {
    name: 'John Smith',
    email: 'john.smith@school.edu',
    role: 'teacher',
    schedule_type: 'fixed',
    start_time: '08:00',
    end_time: '16:00',
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true
  },
  {
    name: 'Jane Doe',
    email: 'jane.doe@school.edu',
    role: 'para-educator',
    schedule_type: 'flexible',
    start_time: '09:00',
    end_time: '15:00',
    monday: true,
    tuesday: false,
    wednesday: true,
    thursday: true,
    friday: false
  }
];

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function downloadTemplate(includeExample: boolean = false): void {
  // Create CSV content
  const content = [
    TEMPLATE_HEADERS.join(','),
    ...(includeExample ? SAMPLE_DATA.map(row => 
      TEMPLATE_HEADERS.map(header => row[header as keyof typeof row]).join(',')
    ) : [])
  ].join('\n');

  downloadCsv(content, `employee_template${includeExample ? '_with_examples' : ''}.csv`);
}

async function exportEmployeesToCsv(): Promise<string> {
  const { data: employees, error } = await supabase
    .from('employees')
    .select(`
      *,
      employee_availability (
        day_of_week,
        start_time,
        end_time
      )
    `)
    .order('name');

  if (error) throw error;

  const csvRows = employees.map(employee => {
    // Create availability map
    const availability = employee.employee_availability.reduce((acc: any, curr: any) => {
      const day = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'][curr.day_of_week - 1];
      acc[day] = true;
      return acc;
    }, {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false
    });

    return {
      name: employee.name,
      email: employee.email,
      role: employee.role,
      schedule_type: employee.schedule_type,
      start_time: employee.default_start_time || employee.shift_start,
      end_time: employee.default_end_time || employee.shift_end,
      ...availability
    };
  });

  const csvContent = [
    CSV_HEADERS,
    ...csvRows.map(row => 
      [
        row.name,
        row.email,
        row.role,
        row.schedule_type,
        row.start_time,
        row.end_time,
        row.monday,
        row.tuesday,
        row.wednesday,
        row.thursday,
        row.friday
      ].join(',')
    )
  ].join('\n');

  return csvContent;
}

export {
  downloadTemplate,
  downloadCsv,
  exportEmployeesToCsv
};