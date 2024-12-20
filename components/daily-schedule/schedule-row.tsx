"use client";

import { Employee } from "@/types/schedule";
import { TimeBlock } from "./time-block";
import { BUSINESS_HOURS } from "@/lib/constants";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils/class-utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ScheduleRowProps {
  employee: Employee;
}

export function ScheduleRow({ employee }: ScheduleRowProps) {
  const router = useRouter();
  const totalHours = employee.schedule.filter(block => block.isActive).length;
  const hoursStatus = totalHours < BUSINESS_HOURS.MIN_HOURS 
    ? "text-destructive"
    : totalHours > BUSINESS_HOURS.MAX_HOURS 
    ? "text-yellow-500"
    : "text-green-500";

  const timeSlots = Array.from(
    { length: BUSINESS_HOURS.END - BUSINESS_HOURS.START },
    (_, index) => {
      const hour = BUSINESS_HOURS.START + index;
      const block = employee.schedule.find(b => b.hour === hour);
      return {
        hour,
        isActive: block?.isActive || false
      };
    }
  );

  const handleViewSchedule = () => {
    router.push(`/dashboard/staff/${employee.id}`);
    console.log('Employee ID:', employee.id)
  };

  return (
    <tr className="border-t">
      <td className="sticky left-0 z-10 bg-background border-r px-4 py-2">
        <div className="font-medium">{employee.name}</div>
        <div className="text-sm text-muted-foreground">{employee.role}</div>
        <div className={cn("text-sm mb-2", hoursStatus)}>
          {totalHours} hours scheduled
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={handleViewSchedule}
        >
          View Schedule
        </Button>
      </td>
      {timeSlots.map((block) => {
        const { setNodeRef, isOver } = useDroppable({
          id: `${employee.id}-drop-${block.hour}`
        });

        return (
          <td 
            key={`${employee.id}-${block.hour}`} 
            ref={setNodeRef}
            className={cn(
              "p-0 border-r min-w-[100px]",
              isOver && "bg-secondary/50"
            )}
          >
            <TimeBlock
              id={`${employee.id}-${block.hour}`}
              hour={block.hour}
              isActive={block.isActive}
              employeeId={employee.id}
            />
          </td>
        );
      })}
    </tr>
  );
}