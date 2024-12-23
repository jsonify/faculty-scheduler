// components/calendar/stats-overview.tsx
"use client";

import { Card } from "@/components/ui/card";
import { useScheduleStore } from "@/lib/stores/schedule-store";

export function StatsOverview() {
  const { employees } = useScheduleStore();
  
  const stats = {
    totalEmployees: employees.length,
    teachers: employees.filter(e => e.role === "Teacher").length,
    paraEducators: employees.filter(e => e.role === "Para-Educator").length,
    scheduled: employees.filter(e => e.schedule?.some(s => s.isActive)).length
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground">Total Staff</h3>
        <p className="text-2xl font-bold">{stats.totalEmployees}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground">Teachers</h3>
        <p className="text-2xl font-bold">{stats.teachers}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground">Para-Educators</h3>
        <p className="text-2xl font-bold">{stats.paraEducators}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground">Scheduled Today</h3>
        <p className="text-2xl font-bold">{stats.scheduled}</p>
      </Card>
    </div>
  );
}