// scripts/import-employees.ts

import fs from 'fs/promises';
import path from 'path';
import { processEmployeeImport } from '../lib/utils/employee-import-processor';

async function importEmployees() {
  try {
    const filePath = process.argv[2];
    if (!filePath) {
      console.error('Please provide a CSV file path');
      process.exit(1);
    }

    console.log('Debug: Reading file from:', filePath);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    console.log('Debug: File stats:', {
      size: fileContent.length,
      firstLine: fileContent.split('\n')[0],
      lineCount: fileContent.split('\n').length
    });
    
    console.log('Processing import...');
    const result = await processEmployeeImport(fileContent, {
      generateRandomSchedules: false,
      skipDuplicates: false,
    });

    if (result.success) {
      console.log(`
Import completed successfully:
- Total rows processed: ${result.totalRows}
- Successfully imported: ${result.successfulImports}
- Employee IDs: ${result.importedEmployees.join(', ')}
      `);
    } else {
      console.error('Import completed with errors:');
      result.errors.forEach(error => {
        console.error(`Row ${error.row + 1}: ${error.field} - ${error.message}`);
      });
      process.exit(1);
    }
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  }
}

importEmployees();