// components/import/import-page.tsx
"use client";

import { EmployeeImport } from "@/components/import/employee-import";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

export function ImportPage() {
  const handleDownloadExample = () => {
    const csvContent = `name,email,role,scheduleType,startTime,endTime,monday,tuesday,wednesday,thursday,friday
John Smith,john.smith@school.edu,teacher,fixed,08:00,16:00,true,true,true,true,true
Jane Doe,jane.doe@school.edu,para-educator,flexible,09:00,15:00,true,true,false,true,true
Bob Wilson,bob.wilson@school.edu,teacher,fixed,07:30,15:30,true,true,true,true,true
Sarah Johnson,sarah.j@school.edu,para-educator,flexible,08:30,14:30,true,false,true,false,true`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'example_staff_import.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = () => {
    const csvContent = `name,email,role,scheduleType,startTime,endTime,monday,tuesday,wednesday,thursday,friday
`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staff_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Import Staff</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <FileDown className="mr-2 h-4 w-4" />
            Download Template
          </Button>
          <Button variant="outline" onClick={handleDownloadExample}>
            <FileDown className="mr-2 h-4 w-4" />
            Download Example
          </Button>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground mb-6">
        <p>To import staff members, prepare a CSV file with the following columns:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li><strong>name</strong> - Full name of the employee</li>
          <li><strong>email</strong> - School email address</li>
          <li><strong>role</strong> - Either &apos;teacher&apos; or &apos;para-educator&apos;</li>
          <li><strong>scheduleType</strong> - Either &apos;fixed&apos; or &apos;flexible&apos;</li>
          <li><strong>startTime</strong> - Start time in HH:MM format (e.g., 08:00)</li>
          <li><strong>endTime</strong> - End time in HH:MM format (e.g., 16:00)</li>
          <li><strong>monday</strong> - Available on Monday (true/false)</li>
          <li><strong>tuesday</strong> - Available on Tuesday (true/false)</li>
          <li><strong>wednesday</strong> - Available on Wednesday (true/false)</li>
          <li><strong>thursday</strong> - Available on Thursday (true/false)</li>
          <li><strong>friday</strong> - Available on Friday (true/false)</li>
        </ul>
        <p className="mt-4">Notes:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>For fixed schedule employees, all weekday fields should be set to true</li>
          <li>For flexible schedule employees, set availability for each day as needed</li>
          <li>All time values should be in 24-hour format (HH:MM)</li>
        </ul>
      </div>

      <EmployeeImport />
    </div>
  );
}