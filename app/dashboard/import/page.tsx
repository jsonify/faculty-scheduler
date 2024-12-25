// app/dashboard/import/page.tsx
import { EmployeeImport } from "@/components/import/employee-import";

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Employee Import</h1>
      </div>
      <EmployeeImport />
    </div>
  );
}