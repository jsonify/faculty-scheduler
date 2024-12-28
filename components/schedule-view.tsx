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
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Daily Time Blocks</h3>
            <div className="relative h-96 overflow-x-auto">
              {/* Timeline */}
              <div className="absolute left-0 right-0 top-0 h-full flex">
                {Array.from({ length: 24 }).map((_, hour) => (
                  <div 
                    key={hour} 
                    className="h-full border-r border-gray-200 relative"
                    style={{ width: '4.1667%' }} // 100% / 24 hours
                  >
                    <span className="absolute -top-5 left-1 text-xs text-gray-500">
                      {hour % 12 === 0 ? 12 : hour % 12} {hour < 12 ? 'AM' : 'PM'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Time Blocks */}
              <div className="absolute left-0 right-0 top-0 h-full">
                {timeBlocks.map((block, index) => {
                  const blockWidth = 4.1667; // Each hour is 4.1667% of width
                  const leftPosition = block.hour * blockWidth;
                  
                  const blockColors = {
                    work: 'bg-blue-500/90',
                    break: 'bg-green-500/90',
                    lunch: 'bg-orange-500/90'
                  };

                  return (
                    <div
                      key={index}
                      className={`absolute h-16 rounded-lg p-2 flex items-center justify-between ${
                        blockColors[block.type]
                      } text-white shadow-sm hover:shadow-md transition-shadow`}
                      style={{
                        left: `${leftPosition}%`,
                        width: `${blockWidth}%`
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium capitalize">
                          {block.type}
                        </span>
                        <span className="text-xs">
                          {block.hour}:00 - {block.hour + 1}:00
                        </span>
                      </div>
                      <button 
                        className="p-1 hover:bg-white/10 rounded"
                        onClick={() => handleUpdateTimeBlock(index, {
                          ...block,
                          isActive: !block.isActive
                        })}
                      >
                        {block.isActive ? '✅' : '⏸️'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <ShiftDialog />
      </Dialog>
    </Card>
  );
}
