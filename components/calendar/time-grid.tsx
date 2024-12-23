// components/calendar/time-grid.tsx

import { BUSINESS_HOURS } from "@/lib/constants";

export function TimeGrid() {
  const hours = Array.from(
    { length: BUSINESS_HOURS.END - BUSINESS_HOURS.START },
    (_, index) => BUSINESS_HOURS.START + index
  );

  return (
    <div className="flex-none w-16 border-r">
      {hours.map((hour) => (
        <div
          key={hour}
          className="h-12 border-b text-xs text-muted-foreground flex items-center justify-center"
        >
          {hour.toString().padStart(2, "0")}:00
        </div>
      ))}
    </div>
  );
}