"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface ScheduleBlockProps {
  id: string;
  hour: number;
  isActive: boolean;
  isDropTarget?: boolean;
}

export function ScheduleBlock({ id, hour, isActive, isDropTarget }: ScheduleBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const blockClasses = cn(
    "rounded-md p-2 h-14 m-1 transition-all duration-200",
    {
      "bg-primary/10 cursor-move hover:bg-primary/20": isActive,
      "bg-secondary/50 hover:bg-secondary/60": !isActive,
      "opacity-50 ring-2 ring-primary": isDragging,
      "ring-2 ring-primary/50": isDropTarget,
    }
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={blockClasses}
      {...(isActive ? { ...attributes, ...listeners } : {})}
    >
      {isActive && (
        <div className="text-xs font-medium text-center">
          {`${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`}
        </div>
      )}
    </div>
  );
}