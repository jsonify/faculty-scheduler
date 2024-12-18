"use client";

import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { DialogTrigger } from "@/components/ui/dialog";

type ScheduleHeaderProps = {
  onAddShift: () => void;
};

export function ScheduleHeader({ onAddShift }: ScheduleHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-semibold">Daily Schedule</h2>
      <DialogTrigger asChild>
        <Button onClick={onAddShift}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Shift
        </Button>
      </DialogTrigger>
    </div>
  );
}