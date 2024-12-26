// components/calendar/day-schedule.tsx

"use client";

import { Card } from "@/components/ui/card";
import { Employee } from "@/types/database";
import { BUSINESS_HOURS } from "@/lib/constants";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useScheduleStore } from "@/lib/stores/schedule-store";

interface DayScheduleProps {
  date: Date;
  employees: Employee[];
}

export function DaySchedule({ date, employees }: DayScheduleProps) {
  const { updateScheduleBlock } = useScheduleStore();
  const [loading, setLoading] = useState<string | null>(null);

  const hours = Array.from(
    { length: BUSINESS_HOURS.END - BUSINESS_HOURS.START },
    (_, i) => BUSINESS_HOURS.START + i
  );

  const handleScheduleClick = async (employeeId: string, hour: number, currentActive: boolean) => {
    setLoading(`${employeeId}-${hour}`);
    await updateScheduleBlock(employeeId, hour, !currentActive);
    setLoading(null);
  };

  const getScheduleBlock = (employee: Employee, hour: number) => {
    return employee.schedules?.find(s => s.hour === hour);
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">
            Schedule for {format(date, 'MMMM d, yyyy')}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-2 sticky left-0 bg-background">Employee</th>
                {hours.map(hour => (
                  <th key={hour} className="p-2 min-w-[80px] text-center">
                    {format(new Date().setHours(hour), 'ha')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map(employee => (
                <tr key={employee.id}>
                  <td className="p-2 sticky left-0 bg-background border-r">
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-muted-foreground capitalize">{employee.role}</div>
                  </td>
                  {hours.map(hour => {
                    const scheduleBlock = getScheduleBlock(employee, hour);
                    const isScheduled = scheduleBlock?.is_active;
                    const isLoading = loading === `${employee.id}-${hour}`;

                    return (
                      <td 
                        key={hour} 
                        className="p-1 border"
                      >
                        <Button
                          variant={isScheduled ? "default" : "ghost"}
                          size="sm"
                          className={cn(
                            "w-full h-12 transition-colors",
                            isScheduled && "bg-primary/10 hover:bg-primary/20",
                            !isScheduled && "hover:bg-muted"
                          )}
                          onClick={() => handleScheduleClick(employee.id, hour, !!isScheduled)}
                          disabled={isLoading}
                        >
                          {isLoading ? "..." : format(new Date().setHours(hour), 'ha')}
                        </Button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}