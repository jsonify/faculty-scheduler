// components/calendar/day-schedule.tsx

"use client";

import { Card } from "@/components/ui/card";
import { DndContext, DragEndEvent, useDraggable, useDroppable, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { useScheduleStore } from "@/lib/stores/schedule-store";
import { Employee, EmployeeAvailability, TemporarySchedule } from "@/types/database";
import { HOUR_BLOCKS } from "@/lib/constants";

interface DayScheduleProps {
  date: Date;
}

export function DaySchedule({ date }: DayScheduleProps) {
  const { 
    employees,
    availabilities, 
    temporarySchedules,
    loading,
    fetchEmployees,
    fetchAvailability,
    updateTemporarySchedule 
  } = useScheduleStore();

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  useEffect(() => {
    fetchEmployees();
    fetchAvailability(date);
  }, [date, fetchEmployees, fetchAvailability]);

  const hours = useMemo(() => Array.from(Array(HOUR_BLOCKS).keys()), []);

  if (loading) {
    return <Card className="p-4">Loading...</Card>;
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const [employeeId, currentHour] = active.id.toString().split('-');
    const [targetEmployeeId, targetHour] = over.id.toString().split('-');

    if (employeeId !== targetEmployeeId) return;

    updateTemporarySchedule(
      targetEmployeeId,
      date.toISOString().split('T')[0],
      parseInt(targetHour),
      true
    );
  };

  return (
    <DndContext 
      sensors={sensors}
      modifiers={[restrictToWindowEdges]}
      onDragEnd={handleDragEnd}
    >
     <Card className="p-4">
       <div className="overflow-x-auto">
         <table className="w-full">
           <thead>
             <tr>
               <th className="p-2">Time</th>
               {employees.map(employee => (
                 <th 
                   key={employee.id} 
                   className={cn(
                     "p-2 min-w-[120px] text-center",
                     employee.role === 'teacher' && "bg-blue-50",
                     employee.role === 'para-educator' && "bg-green-50"
                   )}
                 >
                   <div className="font-medium">{employee.name}</div>
                   <div className="text-sm text-muted-foreground capitalize">
                     {employee.role}
                   </div>
                 </th>
               ))}
             </tr>
           </thead>
           <tbody>
             {hours.map(hour => (
               <tr key={hour}>
                 <td className="p-2 font-medium">
                   {format(new Date().setHours(hour), 'h:mm a')}
                 </td>
                 {employees.map(employee => (
                   <ScheduleCell
                     key={`${employee.id}-${hour}`}
                     employeeId={employee.id}
                     hour={hour}
                     date={date}
                     availabilities={availabilities}
                     temporarySchedules={temporarySchedules}
                   />
                 ))}
               </tr>
             ))}
           </tbody>
         </table>
       </div>
     </Card>
   </DndContext>
 );
}

interface ScheduleCellProps {
 employeeId: string;
 hour: number;
 date: Date;
 availabilities: EmployeeAvailability[];
 temporarySchedules: TemporarySchedule[];
}

function ScheduleCell({ 
 employeeId, 
 hour, 
 date,
 availabilities,
 temporarySchedules 
}: ScheduleCellProps) {
 const isAvailable = availabilities.some(a => 
   a.employee_id === employeeId &&
   parseInt(a.start_time.split(':')[0]) <= hour &&
   parseInt(a.end_time.split(':')[0]) > hour
 );

 const tempSchedule = temporarySchedules.find(t =>
   t.employee_id === employeeId && t.hour === hour
 );

 const { setNodeRef, isOver } = useDroppable({
   id: `${employeeId}-${hour}`
 });

 const { attributes, listeners, setNodeRef: setDragRef } = useDraggable({
   id: `${employeeId}-${hour}`,
   data: { employeeId, hour }
 });

 return (
   <td 
     ref={setNodeRef}
     className={cn(
       "p-1 border",
       isOver && "bg-muted",
       isAvailable && "bg-primary/10",
       tempSchedule?.is_active && "bg-primary/30"
     )}
   >
     {isAvailable && (
       <div
         ref={setDragRef}
         {...listeners}
         {...attributes}
         className="w-full h-12 cursor-move"
       />
     )}
   </td>
 );
}
