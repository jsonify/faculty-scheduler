// components/calendar/calendar-view.tsx
"use client";

import { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { DaySchedule } from "./day-schedule";
import { format } from "date-fns";
import { useScheduleStore } from "@/lib/stores/schedule-store";

export function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { employees } = useScheduleStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-3">
        <Card className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md"
          />
        </Card>
      </div>
      <div className="md:col-span-9">
        <DaySchedule date={selectedDate} employees={employees} />
      </div>
    </div>
  );
}