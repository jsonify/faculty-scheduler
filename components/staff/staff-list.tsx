// components/staff/staff-list.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { StaffCard } from "./staff-card";
import { useScheduleStore } from "@/lib/stores/schedule-store";

export function StaffList() {
  const [searchTerm, setSearchTerm] = useState("");
  const { employees, updateEmployeeSettings } = useScheduleStore();

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredEmployees.map((employee) => (
          <StaffCard 
            key={employee.id} 
            employee={employee}
            onUpdateSettings={updateEmployeeSettings}
          />
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No staff members found
        </div>
      )}
    </div>
  );
}