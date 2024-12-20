// app/dashboard/staff/[id]/page.tsx
"use client";

import { DailyScheduleClient } from "@/components/daily-schedule/daily-schedule-client";
import { useScheduleStore } from "@/lib/stores/schedule-store";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StaffDetailPage({ params }: { params: { id: string } }) {
  const { employees, loading, error, fetchEmployees } = useScheduleStore();

  useEffect(() => {
    console.log('Fetching employees...');
    fetchEmployees();
  }, []); // Remove fetchEmployees from dependency array since it's from Zustand

  const employee = employees.find(e => e.id === params.id);

  if (loading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-[400px] w-full" />
      </Card>
    );
  }

  if (!employee) {
    return (
      <div className="space-y-6">
        <Card className="p-4">
          <div className="text-destructive">
            No schedule found for this employee. (ID: {params.id})
          </div>
          <pre className="mt-2 text-xs">
            Available IDs: {employees.map(e => e.id).join(', ')}
          </pre>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{employee.name}&apos;s Schedule</h1>
      </div>
      
      <DailyScheduleClient employeeId={params.id} />
    </div>
  );
}