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

function getAvailabilityText(employeeId: string, availabilities: EmployeeAvailability[]) {
  const availability = availabilities.filter(a => a.employee_id === employeeId);
  if (availability.length === 0) return 'Not available';
  
  // Group consecutive hours into ranges
  const ranges = [];
  let currentRange: { start: number | null, end: number | null } = { start: null, end: null };
  
  availability.sort((a, b) => parseInt(a.start_time) - parseInt(b.start_time));
  
  availability.forEach(a => {
    const start = parseInt(a.start_time.split(':')[0]);
    const end = parseInt(a.end_time.split(':')[0]);
    
    if (!currentRange.start) {
      currentRange = { start, end };
    } else if (start <= currentRange.end) {
      currentRange.end = Math.max(currentRange.end, end);
    } else {
      ranges.push(currentRange);
      currentRange = { start, end };
    }
  });
  
  if (currentRange.start) {
    ranges.push(currentRange);
  }
  
  // Format ranges, ensuring both start and end are numbers
  return ranges.map(range => {
    if (range.start === null || range.end === null) return '';
    return `${format(new Date(0, 0, 0, range.start), 'h a')} - ${format(new Date(0, 0, 0, range.end), 'h a')}`;
  }).filter(Boolean).join(', ');
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
    const fetchData = async () => {
      try {
        console.log('Fetching employees...');
        await fetchEmployees();
        console.log('Fetching availability...');
        await fetchAvailability(date);
      } catch (error) {
        console.error('Error fetching schedule data:', error);
      }
    };
    
    fetchData();
  }, [date, fetchEmployees, fetchAvailability]);

  const availableEmployees = useMemo(() => {
    return employees.filter(employee => {
      return availabilities.some(a => 
        a.employee_id === employee.id
      );
    });
  }, [employees, availabilities]);

  const hours = useMemo(() => {
    const BUSINESS_HOURS = { start: 8, end: 17 }; // 8am to 5pm
    return Array.from({ length: BUSINESS_HOURS.end - BUSINESS_HOURS.start }, 
      (_, i) => BUSINESS_HOURS.start + i);
  }, []);

  const [draggingBlock, setDraggingBlock] = useState<{startHour: number, duration: number} | null>(null);

  if (loading) {
    return <Card className="p-4">Loading...</Card>;
  }

  const handleDragStart = (event: any) => {
    const [employeeId, startHour] = event.active.id.toString().split('-');
    // Check if there are consecutive active hours to determine block size
    let duration = 1;
    if (temporarySchedules) {
      while (temporarySchedules.some(t => 
        t.employee_id === employeeId && 
        t.hour === parseInt(startHour) + duration &&
        t.is_active
      )) {
        duration++;
      }
    }
    setDraggingBlock({startHour: parseInt(startHour), duration});
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !draggingBlock) return;

    const [employeeId, currentHour] = active.id.toString().split('-');
    const [targetEmployeeId, targetHour] = over.id.toString().split('-');

    if (employeeId !== targetEmployeeId) return;

    try {
      console.log('Moving schedule block:', {
        employeeId: targetEmployeeId,
        date: date.toISOString().split('T')[0],
        fromHour: draggingBlock.startHour,
        toHour: parseInt(targetHour),
        duration: draggingBlock.duration
      });
      
      await updateTemporarySchedule(
        targetEmployeeId,
        date.toISOString().split('T')[0],
        parseInt(targetHour),
        true
      );
      
      console.log('Temporary schedule updated successfully');
    } catch (error) {
      console.error('Error updating temporary schedule:', error);
    } finally {
      setDraggingBlock(null);
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      modifiers={[restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
     <Card className="p-4">
       <div className="overflow-x-auto">
         <table className="w-full">
           <thead>
             <tr>
               <th className="p-2 w-24">Time</th>
               {availableEmployees.map(employee => (
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
                   <div className="text-xs text-muted-foreground">
                     {getAvailabilityText(employee.id, availabilities)}
                   </div>
                 </th>
               ))}
             </tr>
           </thead>
           <tbody>
             {hours.map(hour => (
               <tr key={hour}>
                 <td className="p-2 font-medium border-r bg-muted/50">
                   <div className="flex items-center justify-between">
                     <span>{format(new Date(0, 0, 0, hour), 'h:mm a')}</span>

                   </div>
                 </td>
                 {availableEmployees.map(employee => (
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
 const employeeAvailability = availabilities.filter(a => 
   a.employee_id === employeeId
 );
 
//  console.log(`Availability for employee ${employeeId}:`, employeeAvailability);
 
 const isAvailable = employeeAvailability.some(a => {
   const startHour = parseInt(a.start_time.split(':')[0]);
   const endHour = parseInt(a.end_time.split(':')[0]);
   return hour >= startHour && hour < endHour;
 });

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
       isAvailable && "bg-green-100",
       tempSchedule?.is_active && "bg-blue-100"
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
