// lib/constants.ts

export const BUSINESS_HOURS = {
  START: 6, // 6:00 AM
  END: 17, // 5:00 PM
  MIN_HOURS: 6,
  MAX_HOURS: 8,
  STEP: 60,
} as const;

export const TIME_ZONE = 'America/Los_Angeles';

export const HOUR_BLOCKS = Array.from(
  { length: BUSINESS_HOURS.END - BUSINESS_HOURS.START },
  (_, i) => {
    const hour = i + BUSINESS_HOURS.START;
    return {
      hour,
      label: `${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`,
    };
  }
);

export const EMPLOYEE_COLORS = {
  teacher: 'bg-blue-50 hover:bg-blue-100',
  'para-educator': 'bg-green-50 hover:bg-green-100',
  admin: 'bg-purple-50 hover:bg-purple-100'
} as const;