"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScheduleStore } from "@/lib/stores/schedule-store";
import { DayView } from "./DayView";

// Types for our enhanced calendar functionality
interface CalendarState {
  selectedDate: Date;
  view: "day" | "week";
}

export function ScheduleCalendar() {
  // Track selected date and view type
  const [calendarState, setCalendarState] = useState<CalendarState>({
    selectedDate: new Date(),
    view: "day",
  });

  // Get our scheduling data from the store
  const { employees } = useScheduleStore();

  // Filter to get only para-educators
  const paraEducators = employees.filter(emp => emp.role === "Para-Educator");

  // Handler for date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCalendarState(prev => ({
        ...prev,
        selectedDate: date
      }));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Calendar Selector */}
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Schedule Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={calendarState.selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Schedule View */}
      <div className="md:col-span-9">
        <DayView 
          date={calendarState.selectedDate}
          paraEducators={paraEducators}
        />
      </div>
    </div>
  );
}