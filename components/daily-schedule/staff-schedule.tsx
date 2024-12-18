"use client";

import { Employee } from "@/types/schedule";
import { format } from "date-fns";

type StaffScheduleProps = {
  employee: Employee;
  date: Date;
};

export function StaffSchedule({ employee, date }: StaffScheduleProps) {
  return (
    <div className="relative h-[calc(24*3rem)] border-b">
      <div className="absolute left-0 top-0 h-full w-full">
        {employee.availability.map((slot, index) => {
          const startHour = parseInt(slot.start.split(":")[0]);
          const endHour = parseInt(slot.end.split(":")[0]);
          const top = `${(startHour / 24) * 100}%`;
          const height = `${((endHour - startHour) / 24) * 100}%`;

          return (
            <div
              key={index}
              className="absolute left-0 w-full bg-primary/10 rounded-sm"
              style={{ top, height }}
            >
              <div className="p-2 text-xs">
                <p className="font-medium">{employee.name}</p>
                <p className="text-muted-foreground">
                  {slot.start} - {slot.end}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}