// components/calendar/day-schedule.tsx
import { Card } from "@/components/ui/card";
import { DndContext, DragEndEvent, useDraggable, useDroppable, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { useScheduleStore } from "@/lib/stores/schedule-store";
import { TimeBlock } from "@/types/database";

interface DayScheduleProps {
 date: Date; 
}

function TimeBankStatus({ employeeId, date }: { employeeId: string, date: string }) {
 const { calculateRemainingTime } = useScheduleStore();
 const remainingMinutes = calculateRemainingTime(employeeId, date);
 
 return (
   <div className="text-xs">
     <div className="font-medium">Time Bank:</div>
     <div className={cn(
       "font-mono",
       remainingMinutes < 0 ? "text-red-500" : "text-green-500"
     )}>
       {Math.floor(remainingMinutes / 60)}h {remainingMinutes % 60}m
     </div>
   </div>
 );
}

export function DaySchedule({ date }: DayScheduleProps) {
 const { 
   employees,
   timeBlocks,
   loading,
   fetchEmployees,
   initializeTimeBlocks,
   moveTimeBlock
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
     await fetchEmployees();
     await initializeTimeBlocks(date);
   };
   
   initializeData();
 }, [date, fetchEmployees, initializeTimeBlocks]);

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

 const [draggingBlock, setDraggingBlock] = useState<TimeBlock | null>(null);

 if (loading) {
   return <Card className="p-4">Loading...</Card>;
 }

 const handleDragStart = (event: any) => {
   const blockId = event.active.id;
   const block = timeBlocks.find(b => b.id === blockId);
   if (block) setDraggingBlock(block);
 };

 const handleDragEnd = async (event: DragEndEvent) => {
   const { over } = event;
   if (!over || !draggingBlock) return;

   const newStartTime = over.id as string;
   await moveTimeBlock(draggingBlock.id, newStartTime);
   setDraggingBlock(null);
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
               {employees.map(employee => (
                 <th key={employee.id}>
                   <div className="font-medium">{employee.name}</div>
                   <TimeBankStatus 
                     employeeId={employee.id} 
                     date={date.toISOString().split('T')[0]} 
                   />
                 </th>
               ))}
             </tr>
           </thead>
           <tbody>
             {timeSlots.map(time => (
               <tr key={time}>
                 <td className="p-2 font-medium border-r bg-muted/50">
                   {format(new Date(`1970-01-01T${time}`), 'h:mm a')}
                 </td>
                 {employees.map(employee => (
                   <ScheduleCell
                     key={`${employee.id}-${time}`}
                     employeeId={employee.id}
                     time={time}
                     block={timeBlocks.find(b => 
                       b.employee_id === employee.id &&
                       time >= b.start_time &&
                       time < b.end_time
                     )}
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
 time: string;
 block?: TimeBlock;
}

function ScheduleCell({ employeeId, time, block }: ScheduleCellProps) {
 const { setNodeRef, isOver } = useDroppable({
   id: time
 });

 const { attributes, listeners, setNodeRef: setDragRef } = useDraggable({
   id: block?.id || '',
   data: { blockId: block?.id },
   disabled: !block
 });

 const cellClasses = cn(
   "p-1 border h-12",
   isOver && "bg-muted/50",
   block && {
     'bg-green-100': block.block_type === 'work',
     'bg-yellow-100': block.block_type === 'break',
     'bg-red-100': block.block_type === 'lunch'
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
         className="w-full h-full cursor-move p-2 text-xs"
       >
         {block.block_type === 'work' && 'Working'}
         {block.block_type === 'break' && 'Break'}
         {block.block_type === 'lunch' && 'Lunch'} 
       </div>
     )}
   </td>
 );
}