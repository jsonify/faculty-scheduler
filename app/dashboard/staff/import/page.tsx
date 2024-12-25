// app/dashboard/staff/import/page.tsx

import { EmployeeImport } from "@/components/import/employee-import";
import { Card } from "@/components/ui/card";

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Import Staff</h1>
      </div>
      
      <Card>
        <div className="p-6">
          <EmployeeImport />
        </div>
      </Card>
    </div>
  );
}