"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Employee } from "@/types/schedule";
import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface StaffEditModalProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (employeeId: string, updates: {
    dailyCapacity?: number;
    shiftStart?: string;
    shiftEnd?: string;
    role?: "Teacher" | "Para-Educator";
  }) => void;
}

export function StaffEditModal({ 
  employee, 
  open, 
  onOpenChange, 
  onSave 
}: StaffEditModalProps) {
  // Initialize form state with current employee settings
  const [settings, setSettings] = useState({
    dailyCapacity: employee.dailyCapacity || 480, // 8 hours in minutes
    shiftStart: employee.shiftStart || "09:00",
    shiftEnd: employee.shiftEnd || "17:00",
    role: employee.role || "Teacher"
  });

  const handleSave = () => {
    onSave(employee.id, settings);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Staff Settings - {employee.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={settings.role}
              onValueChange={(value) => 
                setSettings(prev => ({
                  ...prev,
                  role: value as "Teacher" | "Para-Educator"
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Teacher">Teacher</SelectItem>
                <SelectItem value="Para-Educator">Para-Educator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Daily Capacity */}
          <div className="space-y-2">
            <Label htmlFor="dailyCapacity">Daily Capacity (hours)</Label>
            <Select
              value={(settings.dailyCapacity / 60).toString()}
              onValueChange={(value) => 
                setSettings(prev => ({
                  ...prev,
                  dailyCapacity: parseInt(value) * 60
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select hours" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4 hours</SelectItem>
                <SelectItem value="6">6 hours</SelectItem>
                <SelectItem value="8">8 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Shift Times */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shiftStart">Shift Start</Label>
              <Input
                id="shiftStart"
                type="time"
                value={settings.shiftStart}
                onChange={(e) => 
                  setSettings(prev => ({
                    ...prev,
                    shiftStart: e.target.value
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shiftEnd">Shift End</Label>
              <Input
                id="shiftEnd"
                type="time"
                value={settings.shiftEnd}
                onChange={(e) => 
                  setSettings(prev => ({
                    ...prev,
                    shiftEnd: e.target.value
                  }))
                }
              />
            </div>
          </div>

          {/* Para-Educator Specific Settings */}
          {settings.role === "Para-Educator" && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Para-Educator Settings</p>
              <p className="text-sm text-muted-foreground">
                Para-educators can be assigned to support students based on their availability 
                and daily capacity. Make sure to set appropriate hours to ensure optimal 
                scheduling.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}