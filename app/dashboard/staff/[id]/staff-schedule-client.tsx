"use client";

import { Employee } from "@/types/schedule";
import { BUSINESS_HOURS } from "@/lib/constants";
import { Card } from "@/components/ui/card";

export default function StaffScheduleClient({ employee }: { employee: Employee }) {
  const activeHours = employee.schedule
    .filter(block => block.isActive)
    .map(block => ({
      hour: block.hour,
      formatted: `${block.hour % 12 || 12}:00 ${block.hour < 12 ? 'AM' : 'PM'}`
    }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{employee.name}&apos;s Schedule</h1>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Scheduled Hours</h2>
        <div className="space-y-4">
          {activeHours.map(({ hour, formatted }) => (
            <div key={hour} className="flex items-center space-x-4">
              <div className="w-24 font-medium">{formatted}</div>
              <div className="flex-1 h-2 bg-primary/10 rounded-full" />
            </div>
          ))}
          
          <div className="mt-6 text-sm text-muted-foreground">
            Total Hours: {activeHours.length} / {BUSINESS_HOURS.MAX_HOURS} maximum
          </div>
        </div>
      </Card>
    </div>
  );
}