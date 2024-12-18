"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { TimeSlot } from "@/components/schedule/time-slot";
import { ScheduleHeader } from "@/components/schedule/schedule-header";
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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
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
        </div>

        <ShiftDialog />
      </Dialog>
    </Card>
  );
}