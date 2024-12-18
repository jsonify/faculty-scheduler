"use client";

import { useEffect } from "react";
import { StaffCard } from "@/components/staff/staff-card";
import { useScheduleStore } from "@/lib/stores/schedule-store";
import { Skeleton } from "@/components/ui/skeleton";

export function StaffList() {
  const { employees, loading, error, fetchEmployees } = useScheduleStore();

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
        {error}
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground bg-muted rounded-md">
        No staff members found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {employees.map((employee) => (
        <StaffCard key={employee.id} employee={employee} />
      ))}
    </div>
  );
}