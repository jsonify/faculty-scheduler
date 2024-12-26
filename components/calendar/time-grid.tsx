// components/calendar/time-grid.tsx

import { BUSINESS_HOURS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function TimeGrid({ schedules }) {
  const hours = Array.from(
    { length: BUSINESS_HOURS.END - BUSINESS_HOURS.START },
    (_, i) => BUSINESS_HOURS.START + i
  );

  return (
    <div className="flex-none w-16 border-r">
      {hours.map((hour) => (
        <div
          key={hour}
          className={cn(
            "h-12 border-b text-xs text-muted-foreground flex items-center justify-center",
            schedules?.some(s => s.hour === hour && s.is_active) && "bg-primary/10"
          )}
        >
          {hour.toString().padStart(2, "0")}:00
        </div>
      ))}
    </div>
  );
}