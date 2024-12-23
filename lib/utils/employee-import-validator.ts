// lib/utils/employee-import-validator.ts

import { EmployeeImportRow, ImportValidationError } from '../types/employee-import';

export function validateEmployeeRow(
  row: any,
  rowIndex: number
): ImportValidationError[] {
  const errors: ImportValidationError[] = [];

  // Validate name
  if (!row.name || typeof row.name !== 'string' || row.name.trim().length === 0) {
    errors.push({
      row: rowIndex,
      field: 'name',
      message: 'Name is required and must be a non-empty string',
      value: row.name,
    });
  }

  // Validate role
  if (!['teacher', 'para-educator'].includes(row.role)) {
    errors.push({
      row: rowIndex,
      field: 'role',
      message: 'Role must be either "teacher" or "para-educator"',
      value: row.role,
    });
  }

  // Validate schedule_type
  if (!['fixed', 'flexible'].includes(row.schedule_type)) {
    errors.push({
      row: rowIndex,
      field: 'schedule_type',
      message: 'Schedule type must be either "fixed" or "flexible"',
      value: row.schedule_type,
    });
  }

  // Validate time format if schedule_type is fixed
  if (row.schedule_type === 'fixed') {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!timeRegex.test(row.default_start_time)) {
      errors.push({
        row: rowIndex,
        field: 'default_start_time',
        message: 'Invalid start time format. Use HH:MM (24-hour)',
        value: row.default_start_time,
      });
    }

    if (!timeRegex.test(row.default_end_time)) {
      errors.push({
        row: rowIndex,
        field: 'default_end_time',
        message: 'Invalid end time format. Use HH:MM (24-hour)',
        value: row.default_end_time,
      });
    }

    // Validate time range
    if (row.default_start_time && row.default_end_time) {
      const start = new Date(`1970-01-01T${row.default_start_time}`);
      const end = new Date(`1970-01-01T${row.default_end_time}`);
      
      if (start >= end) {
        errors.push({
          row: rowIndex,
          field: 'default_time_range',
          message: 'End time must be after start time',
          value: `${row.default_start_time} - ${row.default_end_time}`,
        });
      }
    }
  }

  return errors;
}

export function validateEmployeeData(
  data: any[]
): ImportValidationError[] {
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