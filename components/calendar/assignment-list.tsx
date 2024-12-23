// components/calendar/assignment-list.tsx
"use client";

import { Employee } from "@/types/schedule";
import { useScheduleStore } from "@/lib/stores/schedule-store";
import { format } from "date-fns";

interface AssignmentListProps {
  date: Date;
  paraEducators: Employee[];
  students: Employee[];
}

export function AssignmentList({ date, paraEducators, students }: AssignmentListProps) {
  const { assignments } = useScheduleStore();
  
  return (
    <div className="flex-1 ml-4">
      {paraEducators.map(para => (
        <div key={para.id} className="mb-4">
          <div className="font-medium mb-2">{para.name}</div>
          <div className="pl-4 border-l">
            {assignments
              .filter(a => 
                a.employeeId === para.id && 
                format(new Date(a.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
              )
              .map(assignment => {
                const student = students.find(s => s.id === assignment.studentId);
                return (
                  <div 
                    key={assignment.id}
                    className="p-2 mb-2 bg-secondary rounded-md"
                  >
                    <div>{student?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(`${assignment.date}T${assignment.startTime}`), 'h:mm a')} - 
                      {format(new Date(`${assignment.date}T${assignment.endTime}`), 'h:mm a')}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}