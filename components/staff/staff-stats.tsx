"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScheduleStore } from "@/lib/stores/schedule-store";

export function StaffStats() {
  const { employees } = useScheduleStore();
  
  const totalStaff = employees.length;
  const teacherCount = employees.filter(e => e.role === 'Teacher').length;
  const paraCount = employees.filter(e => e.role === 'Para-Educator').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Total Staff Members</p>
          <p className="text-2xl font-bold">{totalStaff}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Teachers</p>
          <p className="text-2xl font-bold">{teacherCount}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Para-Educators</p>
          <p className="text-2xl font-bold">{paraCount}</p>
        </div>
      </CardContent>
    </Card>
  );
}