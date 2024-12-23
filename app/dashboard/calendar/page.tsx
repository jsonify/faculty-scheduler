// app/dashboard/calendar/page.tsx
"use client";

import { CalendarView } from "@/components/calendar/calendar-view";
import { StatsOverview } from "@/components/calendar/stats-overview";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Staff Calendar</h1>
      <StatsOverview />
      <CalendarView />
    </div>
  );
}