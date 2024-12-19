"use client";

import { useEffect } from "react";
import { useScheduleStore } from "@/lib/stores/schedule-store";
import StaffScheduleDetail from "./staff-schedule-detail";
import { Skeleton } from "@/components/ui/skeleton";

export default function StaffSchedulePage({ params }: { params: { id: string } }) {
  const { employees, loading, error, fetchEmployees } = useScheduleStore();

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  const employee = employees.find(e => e.id === params.id);
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-destructive mb-4">{error}</p>
        <button 
          onClick={() => fetchEmployees()}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h2 className="text-2xl font-semibold mb-2">Staff Member Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The staff member you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <a 
          href="/dashboard/staff"
          className="text-sm text-primary hover:underline"
        >
          Return to Staff List
        </a>
      </div>
    );
  }

  return <StaffScheduleDetail employee={employee} />;
}