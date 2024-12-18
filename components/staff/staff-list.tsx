"use client";

import { StaffCard } from "@/components/staff/staff-card";
import { useScheduleStore } from "@/lib/stores/schedule-store";

export function StaffList() {
  const { employees } = useScheduleStore();

  return (
    <div className="space-y-4">
      {employees.map((employee) => (
        <StaffCard key={employee.id} employee={employee} />
      ))}
    </div>
  );
}