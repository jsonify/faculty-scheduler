// components/calendar/week-view.tsx

"use client";

import { Employee } from "@/types/database";
import { startOfWeek, addDays, format } from "date-fns";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BUSINESS_HOURS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useScheduleStore } from "@/lib/stores/schedule-store";
import { useState } from "react";

interface WeekViewProps {
  date: Date;
  employees: Employee[];
}

export function WeekView({ date, employees }: WeekViewProps) {
  const { updateScheduleBlock } = useScheduleStore();
  const [loading, setLoading] = useState<string | null>(null);
  const weekStart = startOfWeek(date);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from(
    { length: BUSINESS_HOURS.END - BUSINESS_HOURS.START },
    (_, i) => BUSINESS_HOURS.START + i
  );

  const getScheduledEmployees = (hour: number) => {
    return employees.filter(emp => 
      emp.schedules?.some(schedule => 
        schedule.hour === hour && schedule.is_active
      )
    );
  };

  const handleCellClick = async (hour: number, day: Date) => {
    const cellId = `${format(day, 'yyyy-MM-dd')}-${hour}`;
    setLoading(cellId);

    // Example: Toggle first employee's schedule for simplicity
    // In a real application, you might want to show a modal to select employees
    if (employees.length > 0) {
      const employee = employees[0];
      const currentSchedule = employee.schedules?.find(s => s.hour === hour);
      await updateScheduleBlock(employee.id, hour, !currentSchedule?.is_active);
    }

    setLoading(null);
  };

  return (
    <Card className="p-4">
      <div className="overflow-x-auto">
        <div className="grid grid-cols-8 gap-2 min-w-[800px]">
          {/* Time column */}
          <div className="border-r">
            <div className="h-12" /> {/* Empty cell for alignment */}
            {hours.map(hour => (
              <div key={hour} className="h-12 flex items-center justify-end px-2 text-sm text-muted-foreground">
                {format(new Date().setHours(hour), 'ha')}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, index) => (
            <div key={index} className="flex flex-col">
              <div className="h-12 font-medium text-center p-2">
                {format(day, 'EEE MM/dd')}
              </div>
              
              {hours.map(hour => {
                const scheduledEmployees = getScheduledEmployees(hour);
                const cellId = `${format(day, 'yyyy-MM-dd')}-${hour}`;
                const isLoading = loading === cellId;

                return (
                  <Button
                    key={hour}
                    variant="ghost"
                    className={cn(
                      "h-12 border-t border-l p-1 text-xs",
                      scheduledEmployees.length > 0 && "bg-primary/10 hover:bg-primary/20",
                      "hover:bg-muted"
                    )}
                    onClick={() => handleCellClick(hour, day)}
                    disabled={isLoading}
                  >
                    {isLoading ? "..." : scheduledEmployees.length > 0 && (
                      <span className="text-xs">
                        {scheduledEmployees.length} scheduled
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}