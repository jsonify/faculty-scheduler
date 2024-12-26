// components/calendar/calendar-view.tsx
"use client";

import { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DaySchedule } from "./day-schedule";
import { WeekView } from "./week-view";
import { format } from "date-fns";
import { useScheduleStore } from "@/lib/stores/schedule-store";

export function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const { employees, fetchAvailability } = useScheduleStore();

  useEffect(() => {
    fetchAvailability(selectedDate);
  }, [selectedDate, fetchAvailability]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {format(selectedDate, 'MMMM yyyy')}
        </h2>
        <div className="space-x-2">
          <Button 
            variant={viewMode === 'day' ? 'default' : 'outline'}
            onClick={() => setViewMode('day')}
          >
            Day
          </Button>
          <Button 
            variant={viewMode === 'week' ? 'default' : 'outline'}
            onClick={() => setViewMode('week')}
          >
            Week
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md"
          />
        </div>
        <div className="md:col-span-9">
          {viewMode === 'day' ? (
            <DaySchedule date={selectedDate} employees={employees} />
          ) : (
            <WeekView date={selectedDate} employees={employees} />
          )}
        </div>
      </div>
    </div>
  );
}
