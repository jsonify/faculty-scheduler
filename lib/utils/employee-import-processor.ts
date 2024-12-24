// lib/utils/employee-import-processor.ts

import Papa from 'papaparse';
import { supabase } from '@/lib/supabase';
import { EmployeeImportRow, ImportResult, ImportOptions } from '../types/employee-import';
import { validateEmployeeData } from './employee-import-validator';
import { BUSINESS_HOURS } from '@/lib/constants';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri'] as const;

async function createEmployeeAvailability(
    employeeId: string,
    row: EmployeeImportRow
  ) {
    console.log(`Creating availability for employee ${employeeId}:`, row);
  
    const dayToNumber = {
      mon: 1,
      tue: 2,
      wed: 3,
      thu: 4,
      fri: 5,
    };
  
    const availabilityRecords = DAYS.map(day => {
      const startKey = `${day}_start` as keyof EmployeeImportRow;
      const endKey = `${day}_end` as keyof EmployeeImportRow;
      
      return {
        employee_id: employeeId,
        day_of_week: dayToNumber[day],
        start_time: row[startKey] || row.default_start_time,
        end_time: row[endKey] || row.default_end_time,
      };
    });
  
    console.log('Prepared availability records:', availabilityRecords);
  
    const { data, error } = await supabase
      .from('employee_availability')
      .insert(availabilityRecords)
      .select();
  
    if (error) {
      console.error('Detailed Supabase error:', JSON.stringify(error, null, 2));
      throw error;
    }
  
    console.log('Successfully inserted availability:', data);
    return data;
  }

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
  };

  const parsed = Papa.parse(cleanedContent, parseConfig);

  if (parsed.errors.length > 0) {
    console.log('Debug: Parse errors detected:', parsed.errors);
    result.errors = parsed.errors.map((error) => ({
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
  const validationErrors = validateEmployeeData(data);
  if (validationErrors.length > 0) {
    result.errors = validationErrors;
    return result;
  }

  try {
    for (const [index, row] of data.entries()) {
      try {
        console.log(`Processing row ${index}:`, JSON.stringify(row, null, 2));

        // Remove the duplicate check or modify it
        const { data: employee, error: employeeError } = await supabase
          .from('employees')
          .upsert({  // Use upsert instead of insert to handle potential duplicates
            name: row.name,
            role: row.role,
            schedule_type: row.schedule_type,
            default_start_time: row.schedule_type === 'fixed' ? row.default_start_time : null,
            default_end_time: row.schedule_type === 'fixed' ? row.default_end_time : null,
          })
          .select()
          .single();

        if (employeeError) {
          console.error(`Employee insert error for row ${index}:`, 
            JSON.stringify(employeeError, null, 2)
          );
          throw employeeError;
        }

        console.log(`Successfully inserted/upserted employee:`, employee);

        // Create availability records
        if (employee && employee.id) {
          const availabilityRecords = DAYS.map(day => ({
            employee_id: employee.id,
            day_of_week: {
              'mon': 1,
              'tue': 2,
              'wed': 3,
              'thu': 4,
              'fri': 5
            }[day],
            start_time: row[`${day}_start`] || row.default_start_time,
            end_time: row[`${day}_end`] || row.default_end_time,
          }));

          console.log(`Preparing availability records for ${employee.name}:`, 
            JSON.stringify(availabilityRecords, null, 2)
          );

          const { data: availabilityData, error: availabilityError } = await supabase
            .from('employee_availability')
            .upsert(availabilityRecords)
            .select();

          if (availabilityError) {
            console.error(`Availability insert error for ${employee.name}:`, 
              JSON.stringify(availabilityError, null, 2)
            );
            throw availabilityError;
          }

          console.log(`Successfully inserted availability for ${employee.name}:`, availabilityData);

          result.successfulImports++;
          result.importedEmployees.push(employee.id);
        }

      } catch (error) {
        console.error(`Error processing row ${index}:`, error);
        result.errors.push({
          row: index,
          field: 'database',
          message: error instanceof Error ? error.message : 'Unknown error',
          value: row,
        });
      }
    }
  } catch (error) {
    console.error('Overall import error:', error);
    result.errors.push({
      row: -1,
      field: 'transaction',
      message: 'Transaction failed',
      value: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  result.success = result.errors.length === 0;
  console.log('Final import result:', result);
  return result;
}