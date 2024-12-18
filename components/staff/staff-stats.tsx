"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScheduleStore } from "@/lib/stores/schedule-store";
import { BUSINESS_HOURS } from "@/lib/constants";

export function StaffStats() {
  const { employees } = useScheduleStore();
  
  const totalStaff = employees.length;
  const activeStaff = employees.filter(e => 
    e.schedule.some(block => block.isActive)
  ).length;
  
  const staffWithFullSchedule = employees.filter(e => {
    const activeHours = e.schedule.filter(block => block.isActive).length;
    return activeHours >= BUSINESS_HOURS.MIN_HOURS;
  }).length;

  const coveragePercentage = (staffWithFullSchedule / totalStaff) * 100;

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
          <p className="text-sm font-medium">Active Today</p>
          <p className="text-2xl font-bold">{activeStaff}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Full Schedule Coverage</p>
          <p className="text-2xl font-bold">{coveragePercentage.toFixed(1)}%</p>
          <p className="text-sm text-muted-foreground">
            {staffWithFullSchedule} teachers with {BUSINESS_HOURS.MIN_HOURS}+ hours
          </p>
        </div>
      </CardContent>
    </Card>
  );
}