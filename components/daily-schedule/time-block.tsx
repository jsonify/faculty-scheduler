"use client";

import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils/class-utils";

interface TimeBlockProps {
  id: string;
  hour: number;
  isActive: boolean;
  employeeId: string;
}

export function TimeBlock({ id, hour, isActive, employeeId }: TimeBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useDraggable({
    id,
    data: {
      hour,
      employeeId,
      isActive
    }
  });

  const formattedHour = `${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;

  const blockClasses = cn(
    "h-14 w-full rounded-md transition-all duration-200",
    {
      "bg-primary/10 cursor-move hover:bg-primary/20": isActive,
      "bg-secondary/50": !isActive,
      "opacity-50 ring-2 ring-primary": isDragging,
    }
  );

  return (
    <div className="p-1 h-16">
      <div
        ref={isActive ? setNodeRef : undefined}
        className={blockClasses}
        {...(isActive ? { ...attributes, ...listeners } : {})}
      >
        {isActive && (
          <div className="flex items-center justify-center h-full text-xs font-medium">
            {formattedHour}
          </div>
        )}
      </div>
    </div>
  );
}