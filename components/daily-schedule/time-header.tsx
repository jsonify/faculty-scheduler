"use client";

import { BUSINESS_HOURS } from "@/lib/constants";

export function TimeHeader() {
  const hours = Array.from(
    { length: BUSINESS_HOURS.END - BUSINESS_HOURS.START },
    (_, index) => BUSINESS_HOURS.START + index
  );

  const formatHour = (hour: number) => {
    return `${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
  };

  return (
    <thead>
      <tr>
        <th className="sticky left-0 z-10 bg-background border-r px-4 py-2 w-48">
          Teachers
        </th>
        {hours.map((hour) => (
          <th
            key={hour}
            className="border-r px-4 py-2 min-w-[100px] text-center font-medium"
          >
            {formatHour(hour)}
          </th>
        ))}
      </tr>
    </thead>
  );
}