// Schedule configuration
export const BUSINESS_HOURS = {
  START: 6, // 6:00 AM
  END: 17, // 5:00 PM
  MIN_HOURS: 6, // Minimum required hours per teacher
  MAX_HOURS: 8, // Maximum allowed hours per teacher
} as const;

// Generate hour blocks for the schedule grid
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