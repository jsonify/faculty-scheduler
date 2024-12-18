"use client";

import { Employee } from "@/types/schedule";
import { ScheduleRow } from "./schedule-row";

interface ScheduleGridProps {
  employees: Employee[];
}

export function ScheduleGrid({ employees }: ScheduleGridProps) {
  return (
    <tbody>
      {employees.map((employee) => (
        <ScheduleRow 
          key={employee.id} 
          employee={employee}
        />
      ))}
    </tbody>
  );
}