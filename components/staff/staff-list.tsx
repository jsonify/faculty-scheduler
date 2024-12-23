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
    return <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-[100px] w-full" />
      ))}
    </div>;
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {employees.map((employee) => (
        <StaffCard key={employee.id} employee={employee} />
      ))}
    </div>
  );
}