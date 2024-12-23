// components/calendar/time-slot.tsx
"use client";

import { Employee } from "@/types/database";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TimeSlotProps {
  employee: Employee;
  date: Date;
}

export function TimeSlot({ employee, date }: TimeSlotProps) {
  const shifts = employee.shifts || [];
  
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{employee.name}</h3>
          <p className="text-sm text-muted-foreground capitalize">{employee.role}</p>
        </div>
        
        <div className="flex gap-2">
          {shifts.map((shift, index) => (
            <Badge 
              key={index}
              variant={employee.role === "teacher" ? "default" : "secondary"}
            >
              {format(new Date(`2000-01-01T${shift.start_time}`), 'h:mm a')} - 
              {format(new Date(`2000-01-01T${shift.end_time}`), 'h:mm a')}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}