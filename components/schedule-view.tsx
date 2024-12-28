"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { TimeSlot } from "@/components/schedule/time-slot";
import { ScheduleHeader } from "@/components/schedule/schedule-header";
import { ShiftDialog } from "@/components/schedule/shift-dialog";

import { MOCK_SHIFTS } from "@/constants/mock-shifts";
import { TimeBlock, TimeBlockType } from "@/types/schedule";

export function ScheduleView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);

  const handleAddShift = () => {
    setDialogOpen(true);
  };

  const handleManageShift = (shiftId: string) => {
    const shift = MOCK_SHIFTS.find(s => s.id === shiftId);
    if (shift) {
      // Convert shift to time blocks
      const blocks: TimeBlock[] = [
        {
          hour: 6,
          isActive: true,
          type: 'work'
        },
        {
          hour: 12,
          isActive: true,
          type: 'lunch'
        },
        // Add more blocks based on shift times
      ];
      setTimeBlocks(blocks);
    }
  };

  const handleAddTimeBlock = (block: TimeBlock) => {
    setTimeBlocks(prev => [...prev, block]);
  };

  const handleUpdateTimeBlock = (index: number, updatedBlock: TimeBlock) => {
    setTimeBlocks(prev => prev.map((block, i) => 
      i === index ? updatedBlock : block
    ));
  };

  return (
    <Card className="p-6">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <ScheduleHeader onAddShift={handleAddShift} />
        
        <div className="grid grid-cols-1 gap-4">
          {MOCK_SHIFTS.map((shift) => (
            <TimeSlot
              key={shift.id}
              startTime={shift.startTime}
              endTime={shift.endTime}
              staffCount={shift.staffCount}
              onManage={() => handleManageShift(shift.id)}
            />
          ))}
          
          {timeBlocks.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Time Blocks</h3>
              <div className="space-y-2">
                {timeBlocks.map((block, index) => (
                  <div key={index} className="p-2 border rounded">
                    <span>Hour: {block.hour}</span>
                    <span className="mx-2">|</span>
                    <span>Type: {block.type}</span>
                    <span className="mx-2">|</span>
                    <span>Status: {block.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <ShiftDialog />
      </Dialog>
    </Card>
  );
}
