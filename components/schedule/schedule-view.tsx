// components/schedule/schedule-view.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimeSlot } from "@/components/schedule/time-slot";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ShiftDialog } from "@/components/schedule/shift-dialog";

const MOCK_SHIFTS = [
  {
    id: '1',
    startTime: '6:00 AM',
    endTime: '2:00 PM',
    staffCount: 3,
  },
  {
    id: '2',
    startTime: '2:00 PM',
    endTime: '10:00 PM',
    staffCount: 2,
  },
];

export function ScheduleView() {
  const [selectedDate] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddShift = () => {
    setDialogOpen(true);
  };

  const handleManageShift = (shiftId: string) => {
    // Handle managing shift
  };

  return (
    <Card className="p-6">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Daily Schedule</h2>
          <DialogTrigger asChild>
            <Button onClick={handleAddShift} variant="default">
              Add Shift
            </Button>
          </DialogTrigger>
        </div>
        
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
        </div>

        <ShiftDialog />
      </Dialog>
    </Card>
  );
}