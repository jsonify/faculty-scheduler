// components/staff/staff-edit-modal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Employee } from "@/types/schedule";
import { useState } from "react";

interface StaffEditModalProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (employeeId: string, updates: { 
    dailyCapacity?: number;
    shiftStart?: string;
    shiftEnd?: string;
  }) => void;
}

export function StaffEditModal({ 
  employee, 
  open, 
  onOpenChange,
  onSave 
}: StaffEditModalProps) {
  const [capacity, setCapacity] = useState(employee.dailyCapacity?.toString() || "480");
  const [shiftStart, setShiftStart] = useState(employee.shiftStart || "09:00");
  const [shiftEnd, setShiftEnd] = useState(employee.shiftEnd || "17:00");

  const capacityOptions = Array.from({ length: 33 }, (_, i) => (i + 1) * 15);

  const handleSave = () => {
    onSave(employee.id, {
      dailyCapacity: parseInt(capacity),
      shiftStart,
      shiftEnd
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Staff Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Daily Capacity</Label>
            <Select value={capacity} onValueChange={setCapacity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {capacityOptions.map((minutes) => (
                  <SelectItem key={minutes} value={minutes.toString()}>
                    {Math.floor(minutes / 60)}h {minutes % 60}m
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Shift Start</Label>
              <Input
                type="time"
                value={shiftStart}
                onChange={(e) => setShiftStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Shift End</Label>
              <Input
                type="time"
                value={shiftEnd}
                onChange={(e) => setShiftEnd(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}