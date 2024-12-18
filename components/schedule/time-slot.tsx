"use client";

import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

type TimeSlotProps = {
  startTime: string;
  endTime: string;
  staffCount: number;
  onManage: () => void;
};

export function TimeSlot({ startTime, endTime, staffCount, onManage }: TimeSlotProps) {
  return (
    <div className="flex items-center p-4 bg-secondary rounded-lg">
      <Clock className="h-5 w-5 mr-3" />
      <div className="flex-1">
        <p className="font-medium">
          {startTime} - {endTime}
        </p>
        <p className="text-sm text-muted-foreground">
          {staffCount} Staff Member{staffCount !== 1 ? 's' : ''}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onManage}>
        Manage
      </Button>
    </div>
  );
}