// lib/utils/employee-validator.ts

import { EmployeeImportRow, ImportValidationError } from '../types/employee-import';
import { BUSINESS_HOURS } from '@/lib/constants';

interface ValidationResult {
  data: EmployeeImportRow[];
  errors: ImportValidationError[];
}
const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

function validateTimeFormat(time: string): boolean {
  return TIME_REGEX.test(time);
}

function validateTimeRange(start: string, end: string): boolean {
  const startDate = new Date(`1970-01-01T${start}`);
  const endDate = new Date(`1970-01-01T${end}`);
  return startDate < endDate;
}

function validateBusinessHours(time: string, isEndTime: boolean = false): boolean {
  const hour = parseInt(time.split(':')[0]);
  if (isEndTime) {
    return hour >= BUSINESS_HOURS.START && hour <= BUSINESS_HOURS.END;
  }
  return hour >= BUSINESS_HOURS.START && hour < BUSINESS_HOURS.END;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function parseBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lowered = value.toLowerCase();
    if (['true', 't', '1', 'yes', 'y'].includes(lowered)) return true;
    if (['false', 'f', '0', 'no', 'n'].includes(lowered)) return false;
  }
  if (typeof value === 'number') return value === 1;
  return false;
}

export function validateEmployeeData(data: any[]): ValidationResult {
  const errors: ImportValidationError[] = [];
  
  if (!Array.isArray(data) || data.length === 0) {
    errors.push({
      row: -1,
      field: 'file',
      message: 'No valid data rows found in import file'
    });
    return {
      data: [],
      errors: errors
    };
  }

  // Check for duplicate emails
  const emails = new Set<string>();
  data.forEach((row, index) => {
    if (row.email) {
      if (emails.has(row.email.toLowerCase())) {
        errors.push({
          row: index,
          field: 'email',
          message: 'Duplicate email address found',
          value: row.email
        });
      }
      emails.add(row.email.toLowerCase());
    }
  });

  // Validate each row
  data.forEach((row, index) => {
    // Required fields
    if (!row.name?.trim()) {
      errors.push({
        row: index,
        field: 'name',
        message: 'Name is required',
        value: row.name
      });
    }

    if (!row.email?.trim()) {
      errors.push({
        row: index,
        field: 'email',
        message: 'Email is required',
        value: row.email
      });
    } else if (!validateEmail(row.email)) {
      errors.push({
        row: index,
        field: 'email',
        message: 'Invalid email format',
        value: row.email
      });
    }

    // Role validation
    if (!row.role?.trim()) {
      errors.push({
        row: index,
        field: 'role',
        message: 'Role is required',
        value: row.role
      });
    } else {
      const role = row.role.toLowerCase();
      if (!['teacher', 'para-educator', 'admin'].includes(role)) {
        errors.push({
          row: index,
          field: 'role',
          message: 'Invalid role. Must be "teacher", "para-educator", or "admin"',
          value: role
        });
      }
    }

    // Schedule type validation
    if (!row.schedule_type?.trim()) {
      errors.push({
        row: index,
        field: 'schedule_type',
        message: 'Schedule type is required',
        value: row.schedule_type
      });
    } else {
      const scheduleType = row.schedule_type.toLowerCase();
      if (!['fixed', 'flexible'].includes(scheduleType)) {
        errors.push({
          row: index,
          field: 'schedule_type',
          message: 'Invalid schedule type. Must be "fixed" or "flexible"',
          value: scheduleType
        });
      }
    }

    // Time validation
    if (row.start_time && !validateTimeFormat(row.start_time)) {
      errors.push({
        row: index,
        field: 'start_time',
        message: 'Invalid start time format. Use HH:MM',
        value: row.start_time
      });
    }

    if (row.end_time && !validateTimeFormat(row.end_time)) {
      errors.push({
        row: index,
        field: 'end_time',
        message: 'Invalid end time format. Use HH:MM',
        value: row.end_time
      });
    }

    if (row.start_time && row.end_time && 
        validateTimeFormat(row.start_time) && 
        validateTimeFormat(row.end_time)) {
      
      if (!validateTimeRange(row.start_time, row.end_time)) {
        errors.push({
          row: index,
          field: 'time_range',
          message: 'End time must be after start time',
          value: `${row.start_time} - ${row.end_time}`
        });
      }

      if (!validateBusinessHours(row.start_time)) {
        errors.push({
          row: index,
          field: 'start_time',
          message: `Start time must be between ${BUSINESS_HOURS.START}:00 and ${BUSINESS_HOURS.END}:00`,
          value: row.start_time
        });
      }

      if (!validateBusinessHours(row.end_time, true)) {
        errors.push({
          row: index,
          field: 'end_time',
          message: `End time must be between ${BUSINESS_HOURS.START}:00 and ${BUSINESS_HOURS.END}:00`,
          value: row.end_time
        });
      }
    }

    // Availability validation
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
      const value = row[day];
      // Parse and normalize boolean value
      const parsedValue = parseBoolean(value);
      row[day] = parsedValue; // Update the row with normalized value
     
      if (value === undefined || value === '') {
        errors.push({
          row: index,
          field: day,
          message: `${day.charAt(0).toUpperCase() + day.slice(1)} availability is required`,
          value: value
        });
      }
     });
  });

  return {
    data: data as EmployeeImportRow[],
    errors: errors
  };
}