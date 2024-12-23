// app/api/employees/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { processEmployeeImport } from '@/lib/utils/employee-import-processor';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();

    // Process the import
    const result = await processEmployeeImport(fileContent, {
      generateRandomSchedules: true,
      skipDuplicates: true,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing import:', error);
    return NextResponse.json(
      { error: 'Failed to process import' },
      { status: 500 }
    );
  }
}