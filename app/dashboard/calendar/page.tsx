// app/dashboard/calendar/page.tsx

import { CalendarView } from "@/components/calendar/calendar-view";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Schedule Calendar</h1>
      <CalendarView />
    </div>
  );
}