// lib/utils/employee-import-processor.ts

import Papa from 'papaparse';
import { supabase } from '@/lib/supabase';
import { EmployeeImportRow, ImportResult, ImportOptions } from '../types/employee-import';
import { validateEmployeeData } from './employee-validator';
import { BUSINESS_HOURS } from '@/lib/constants';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri'] as const;

async function createEmployeeAvailability(employeeId: string, row: EmployeeImportRow) {
  console.log('Creating availability for employee:', employeeId);

  const availabilityRecords = DAYS.map(day => ({
    employee_id: employeeId,
    day_of_week: {
      'mon': 1,
      'tue': 2,
      'wed': 3,
      'thu': 4,
      'fri': 5
    }[day],
    start_time: row.start_time,
    end_time: row.end_time
  }));

  const { data, error } = await supabase
    .from('employee_availability')
    .insert(availabilityRecords)
    .select();

  if (error) {
    console.error('Error creating availability:', error);
    throw error;
  }

  return data;
}

export async function processEmployeeImport(
  fileContent: string,
  options: ImportOptions = {}
): Promise<ImportResult> {
  console.log('Starting employee import process');
  
  const result: ImportResult = {
    success: false,
    totalRows: 0,
    successfulImports: 0,
    errors: [],
    importedEmployees: []
  };

  // Clean and parse CSV
  const parseConfig = {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.toLowerCase().trim(),
    delimiter: ',',
    quoteChar: '"',
    escapeChar: '"'
  };

  const parsed = Papa.parse(fileContent, parseConfig);
  console.log('CSV Parse Result:', { rows: parsed.data.length, errors: parsed.errors.length });

  if (parsed.errors.length > 0) {
    result.errors = parsed.errors.map(error => ({
      row: error.row !== undefined ? error.row : -1,
      field: 'csv_parse',
      message: error.message,
      value: error.code
    }));
    return result;
  }

  
  // Validate data
  const validationErrors = validateEmployeeData(parsed.data);
  
  if (validationErrors.length > 0) {
    result.errors = validationErrors;
    return result;
  }
  
  const data = parsed.data as EmployeeImportRow[];
  result.totalRows = data.length;

  try {
    // Process each row
    for (const [index, row] of data.entries()) {
      try {
        console.log(`Processing employee ${index + 1}/${data.length}:`, row.name);

        // Create or update employee
        const { data: employee, error: employeeError } = await supabase
          .from('employees')
          .upsert({
            name: row.name,
            email: row.email,
            role: row.role,
            schedule_type: row.schedule_type,
            default_start_time: row.start_time,
            default_end_time: row.end_time,
            is_active: true
          })
          .select()
          .single();

        if (employeeError) {
          throw employeeError;
        }

        if (employee) {
          // Create weekly availability
          const availabilityData = {
            monday: row.monday,
            tuesday: row.tuesday,
            wednesday: row.wednesday,
            thursday: row.thursday,
            friday: row.friday,
            start_time: row.start_time,
            end_time: row.end_time
          };

          await createEmployeeAvailability(employee.id, {
            ...row,
            ...availabilityData
          });

          result.successfulImports++;
          result.importedEmployees.push(employee.id);
          console.log(`Successfully imported employee: ${employee.name}`);
        }

      } catch (error) {
        console.error(`Error processing row ${index + 1}:`, error);
        result.errors.push({
          row: index,
          field: 'database',
          message: error instanceof Error ? error.message : 'Unknown error',
          value: JSON.stringify(row)
        });
      }
    }

    result.success = result.successfulImports === result.totalRows;

  } catch (error) {
    console.error('Fatal import error:', error);
    result.errors.push({
      row: -1,
      field: 'import',
      message: 'Import process failed',
      value: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  console.log('Import process completed:', {
    total: result.totalRows,
    successful: result.successfulImports,
    errors: result.errors.length
  });

  return result;
}