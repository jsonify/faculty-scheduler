// lib/utils/employee-import-processor.ts

import Papa from 'papaparse';
import { supabase } from '@/lib/supabase';
import { EmployeeImportRow, ImportResult, ImportOptions } from '../types/employee-import';
import { validateEmployeeData } from './employee-import-validator';
import { BUSINESS_HOURS } from '@/lib/constants';

function generateRandomSchedule() {
  const schedule = Array.from(
    { length: BUSINESS_HOURS.END - BUSINESS_HOURS.START },
    (_, index) => ({
      hour: BUSINESS_HOURS.START + index,
      isActive: false,
    })
  );

  const startIndex = Math.floor(
    Math.random() * (schedule.length - BUSINESS_HOURS.MIN_HOURS)
  );
  const hoursToActivate =
    Math.floor(
      Math.random() * (BUSINESS_HOURS.MAX_HOURS - BUSINESS_HOURS.MIN_HOURS + 1)
    ) + BUSINESS_HOURS.MIN_HOURS;

  for (let i = 0; i < hoursToActivate; i++) {
    if (startIndex + i < schedule.length) {
      schedule[startIndex + i].isActive = true;
    }
  }

  return schedule;
}

export async function processEmployeeImport(
  fileContent: string,
  options: ImportOptions = {}
): Promise<ImportResult> {
      // Clean up the file content by removing any comment lines
  const cleanedContent = fileContent
    .split('\n')
    .filter(line => !line.trim().startsWith('//'))
    .join('\n');
    
  console.log('Debug: Cleaned file content:', cleanedContent);
  console.log('Debug: File content received:', cleanedContent.slice(0, 200), '...');
  console.log('Debug: File content length:', cleanedContent.length);

  const result: ImportResult = {
    success: false,
    totalRows: 0,
    successfulImports: 0,
    errors: [],
    importedEmployees: [],
  };

  // Parse CSV with debug config
  const parseConfig = {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.toLowerCase().trim(),
    delimiter: ',',
    quoteChar: '"',
    escapeChar: '"',
    complete: (results: Papa.ParseResult<any>) => {
      console.log('Debug: Parse complete callback:', {
        data: results.data.slice(0, 2),
        errors: results.errors,
        meta: results.meta
      });
    },
    error: (error: Papa.ParseError) => {
      console.log('Debug: Parse error:', error);
    },
  };

  console.log('Debug: Parse config:', parseConfig);
  const parsed = Papa.parse(cleanedContent, parseConfig);

  console.log('Debug: Parse result:', {
    errors: parsed.errors,
    meta: parsed.meta,
    firstRow: parsed.data[0],
    totalRows: parsed.data.length
  });

  if (parsed.errors.length > 0) {
    console.log('Debug: Parse errors detected:', parsed.errors);
    result.errors = parsed.errors.map((error, index) => ({
      row: error.row !== undefined ? error.row : -1,
      field: 'csv_parse',
      message: error.message,
      value: error.code,
    }));
    return result;
  }

  const data = parsed.data as EmployeeImportRow[];
  result.totalRows = data.length;

  // Validate data
  console.log('Debug: Starting data validation for', data.length, 'rows');
  const validationErrors = validateEmployeeData(data);
  if (validationErrors.length > 0) {
    console.log('Debug: Validation errors:', validationErrors);
    result.errors = validationErrors;
    return result;
  }

  // Process each row
  for (const [index, row] of data.entries()) {
    try {
      console.log('Debug: Processing row', index, ':', row);

      // Check for existing employee if skipDuplicates is true
      if (options.skipDuplicates) {
        const { data: existing } = await supabase
          .from('employees')
          .select('id')
          .eq('name', row.name)
          .single();

        if (existing) {
          console.log('Debug: Skipping duplicate employee:', row.name);
          continue;
        }
      }

      // Insert employee
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .insert({
          name: row.name,
          role: row.role,
          schedule_type: row.schedule_type,
          default_start_time: row.schedule_type === 'fixed' ? row.default_start_time : null,
          default_end_time: row.schedule_type === 'fixed' ? row.default_end_time : null,
        })
        .select()
        .single();

      if (employeeError) {
        console.log('Debug: Database error on insert:', employeeError);
        throw employeeError;
      }

      console.log('Debug: Successfully inserted employee:', employee);

      // Generate and insert schedule if requested
      if (options.generateRandomSchedules && employee) {
        const schedule = generateRandomSchedule();
        console.log('Debug: Generated random schedule for', employee.name, ':', schedule);
        // Insert schedule records...
        // Implementation depends on your schedule table structure
      }

      result.successfulImports++;
      result.importedEmployees.push(employee.id);
    } catch (error) {
      console.log('Debug: Error processing row', index, ':', error);
      result.errors.push({
        row: index,
        field: 'database',
        message: error instanceof Error ? error.message : 'Unknown error during import',
        value: row,
      });
    }
  }

  result.success = result.errors.length === 0;
  console.log('Debug: Final import result:', result);
  return result;
}