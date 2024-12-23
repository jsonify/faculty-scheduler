// components/calendar/calendar-view.tsx
"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { DaySchedule } from "@/components/calendar/day-schedule";
import { Card } from "@/components/ui/card";

export function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <Card className="md:col-span-3 p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-md"
        />
      </Card>

      <div className="md:col-span-9">
        <DaySchedule date={selectedDate} />
      </div>
    </div>
  );
}