// lib/constants/csv-templates.ts

export const CSV_HEADERS = [
    "name",
    "email",
    "role",
    "schedule_type",
    "start_time",
    "end_time",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday"
  ].join(',');
  
  export const CSV_EXAMPLE = `
  name,email,role,schedule_type,start_time,end_time,monday,tuesday,wednesday,thursday,friday
  John Smith,john.smith@school.edu,teacher,fixed,08:00,15:00,true,true,true,true,true
  Jane Doe,jane.doe@school.edu,para-educator,flexible,09:00,14:00,true,true,false,true,true
  Admin User,admin@school.edu,admin,fixed,08:00,16:00,true,true,true,true,true
  `.trim();
  
  export const CSV_TEMPLATE = `
  name,email,role,schedule_type,start_time,end_time,monday,tuesday,wednesday,thursday,friday
  `.trim();