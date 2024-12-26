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
    timeBlocks,
    loading,
    availabilities,
    fetchEmployees,
    initializeTimeBlocks,
    moveTimeBlock,
    addBreak,
    addLunch,
    removeTimeBlock
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
    const initializeData = async () => {
      try {
        console.log('Fetching employees...');
        await fetchEmployees();
        console.log('Initializing time blocks...');
        await initializeTimeBlocks(date);
      } catch (error) {
        console.error('Error initializing schedule data:', error);
      }
    };
    
    initializeData();
  }, [date, fetchEmployees, initializeTimeBlocks]);

  const availableEmployees = useMemo(() => {
    return employees.filter(employee => {
      return availabilities.some(a => 
        a.employee_id === employee.id
      );
    });
  }, [employees, availabilities]);

  const timeSlots = useMemo(() => {
    const start = 9 * 60; // 9:00 AM in minutes
    const end = 16 * 60; // 4:00 PM in minutes
    const interval = 15; // 15 minute intervals
    
    return Array.from({ length: (end - start) / interval }, (_, i) => {
      const minutes = start + i * interval;
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    });
  }, []);

  const [draggingBlock, setDraggingBlock] = useState<{startHour: number, duration: number} | null>(null);

  if (loading) {
    return <Card className="p-4">Loading...</Card>;
  }

  const handleDragStart = (event: any) => {
    const blockId = event.active.id;
    const block = timeBlocks.find(b => b.id === blockId);
    if (block) {
      setDraggingBlock({
        id: blockId,
        startTime: block.startTime,
        endTime: block.endTime
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !draggingBlock) return;

    const targetTime = over.id; // This will be in "HH:mm" format
    const duration = 
      (new Date(`1970-01-01T${draggingBlock.endTime}:00`).getTime() - 
       new Date(`1970-01-01T${draggingBlock.startTime}:00`).getTime()) / 60000;

    const newStartTime = targetTime;
    const newEndTime = 
      new Date(`1970-01-01T${targetTime}:00`).getTime() + duration * 60000;

    try {
      await moveTimeBlock(
        draggingBlock.id,
        newStartTime,
        new Date(newEndTime).toTimeString().slice(0, 5)
      );
    } catch (error) {
      console.error('Error moving time block:', error);
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
             {timeSlots.map((time, i) => (
               <tr key={time}>
                 <td className="p-2 font-medium border-r bg-muted/50">
                   <div className="flex items-center justify-between">
                     <span>{format(new Date(`1970-01-01T${time}:00`), 'h:mm a')}</span>
                   </div>
                 </td>
                 {availableEmployees.map(employee => {
                   const block = timeBlocks.find(b => 
                     b.employeeId === employee.id &&
                     time >= b.startTime &&
                     time < b.endTime
                   );
                   
                   return (
                     <ScheduleCell
                       key={`${employee.id}-${time}`}
                       employeeId={employee.id}
                       time={time}
                       block={block}
                     />
                   );
                 })}
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
  time: string;
  block?: TimeBlock;
}

function ScheduleCell({ employeeId, time, block }: ScheduleCellProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${employeeId}-${time}`
  });

  const { attributes, listeners, setNodeRef: setDragRef } = useDraggable({
    id: block?.id || `${employeeId}-${time}`,
    data: { blockId: block?.id }
  });

  const cellClasses = cn(
    "p-1 border h-12",
    isOver && "bg-muted/50",
    block && {
      'bg-green-100': block.type === 'work',
      'bg-yellow-100': block.type === 'break',
      'bg-red-100': block.type === 'lunch'
    }
  );

  return (
    <td 
      ref={setNodeRef}
      className={cellClasses}
    >
      {block && (
        <div
          ref={setDragRef}
          {...listeners}
          {...attributes}
          className="w-full h-full cursor-move p-2"
        >
          {block.type === 'work' && 'Working'}
          {block.type === 'break' && 'Break'}
          {block.type === 'lunch' && 'Lunch'}
        </div>
      )}
    </td>
  );
}
