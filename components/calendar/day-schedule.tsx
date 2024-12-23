// components/calendar/day-schedule.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Employee } from "@/types/schedule";
import { TimeGrid } from "./time-grid";
import { AssignmentList } from "./assignment-list";
import { format } from "date-fns";

interface DayScheduleProps {
  date: Date;
  employees: Employee[];
}

export function DaySchedule({ date, employees }: DayScheduleProps) {
  const paraEducators = employees.filter(emp => emp.role === "Para-Educator");
  const students = employees.filter(emp => emp.role === "student");

  return (
    <Card className="p-4">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Schedule for {format(date, 'MMMM d, yyyy')}
          </h2>
        </div>
        
        <div className="flex">
          <TimeGrid />
          <AssignmentList 
            date={date}
            paraEducators={paraEducators}
            students={students}
          />
        </div>
      </div>
    </Card>
  );
}