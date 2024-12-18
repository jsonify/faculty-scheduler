"use client";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function TimeGrid() {
  return (
    <div className="flex-none w-16 border-r">
      {HOURS.map((hour) => (
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