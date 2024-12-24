// lib/utils/employee-import-validator.ts

import { EmployeeImportRow, ImportValidationError } from '../types/employee-import';
import { BUSINESS_HOURS } from '@/lib/constants';

const TIME_REGEX = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri'] as const;

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

function validateDayAvailability(
  row: EmployeeImportRow,
  day: typeof DAYS[number],
  errors: ImportValidationError[],
  rowIndex: number
): void {
  const startKey = `${day}_start` as keyof EmployeeImportRow;
  const endKey = `${day}_end` as keyof EmployeeImportRow;
  const startTime = row[startKey];
  const endTime = row[endKey];

  if (typeof startTime !== 'string' || typeof endTime !== 'string') {
    errors.push({
      row: rowIndex,
      field: `${day}_availability`,
      message: `Missing ${day} availability times`,
    });
    return;
  }

  // Validate time format
  if (!validateTimeFormat(startTime)) {
    errors.push({
      row: rowIndex,
      field: startKey,
      message: `Invalid ${day} start time format. Use HH:MM (24-hour)`,
      value: startTime,
    });
  }

  if (!validateTimeFormat(endTime)) {
    errors.push({
      row: rowIndex,
      field: endKey,
      message: `Invalid ${day} end time format. Use HH:MM (24-hour)`,
      value: endTime,
    });
  }

  // Validate time range
  if (validateTimeFormat(startTime) && validateTimeFormat(endTime)) {
    if (!validateTimeRange(startTime, endTime)) {
      errors.push({
        row: rowIndex,
        field: `${day}_time_range`,
        message: `${day} end time must be after start time`,
        value: `${startTime} - ${endTime}`,
      });
    }

    // Validate business hours
    if (!validateBusinessHours(startTime)) {
      errors.push({
        row: rowIndex,
        field: startKey,
        message: `${day} start time must be within business hours (${BUSINESS_HOURS.START}:00-${BUSINESS_HOURS.END}:00)`,
        value: startTime,
      });
    }

    if (!validateBusinessHours(endTime, true)) {
      errors.push({
        row: rowIndex,
        field: endKey,
        message: `${day} end time must be within business hours (${BUSINESS_HOURS.START}:00-${BUSINESS_HOURS.END}:00)`,
        value: endTime,
      });
    }
  }
}

export function validateEmployeeRow(
  row: any,
  rowIndex: number
): ImportValidationError[] {
  const errors: ImportValidationError[] = [];

  // Validate basic employee information
  if (!row.name || typeof row.name !== 'string' || row.name.trim().length === 0) {
    errors.push({
      row: rowIndex,
      field: 'name',
      message: 'Name is required and must be a non-empty string',
      value: row.name,
    });
  }

  if (!['teacher', 'para-educator', 'admin'].includes(row.role)) {
    errors.push({
      row: rowIndex,
      field: 'role',
      message: 'Role must be either "teacher", "para-educator", or "admin"',
      value: row.role,
    });
  }

  if (!['fixed', 'flexible'].includes(row.schedule_type)) {
    errors.push({
      row: rowIndex,
      field: 'schedule_type',
      message: 'Schedule type must be either "fixed" or "flexible"',
      value: row.schedule_type,
    });
  }

  // Validate default schedule times if fixed schedule
  if (row.schedule_type === 'fixed') {
    if (!validateTimeFormat(row.default_start_time)) {
      errors.push({
        row: rowIndex,
        field: 'default_start_time',
        message: 'Invalid default start time format. Use HH:MM (24-hour)',
        value: row.default_start_time,
      });
    }

    if (!validateTimeFormat(row.default_end_time)) {
      errors.push({
        row: rowIndex,
        field: 'default_end_time',
        message: 'Invalid default end time format. Use HH:MM (24-hour)',
        value: row.default_end_time,
      });
    }

    if (validateTimeFormat(row.default_start_time) && validateTimeFormat(row.default_end_time)) {
      if (!validateTimeRange(row.default_start_time, row.default_end_time)) {
        errors.push({
          row: rowIndex,
          field: 'default_time_range',
          message: 'Default end time must be after start time',
          value: `${row.default_start_time} - ${row.default_end_time}`,
        });
      }
    }
  }

  // Validate daily availability
  DAYS.forEach(day => {
    validateDayAvailability(row, day, errors, rowIndex);
  });

  return errors;
}

export function validateEmployeeData(data: any[]): ImportValidationError[] {
  let errors: ImportValidationError[] = [];
  
  // Check for duplicate names
  const names = new Set<string>();
  data.forEach((row, index) => {
    if (row.name) {
      const normalizedName = row.name.toLowerCase().trim();
      if (names.has(normalizedName)) {
        errors.push({
          row: index,
          field: 'name',
          message: 'Duplicate employee name found',
          value: row.name,
        });
      }
      names.add(normalizedName);
    }
  });

  // Validate each row
  data.forEach((row, index) => {
    errors = [...errors, ...validateEmployeeRow(row, index)];
  });

  return errors;
}