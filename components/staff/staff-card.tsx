// components/staff/staff-card.tsx
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Employee } from "@/types/schedule";
import { Clock, ChevronRight, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { StaffEditModal } from "./staff-edit-modal";

interface StaffCardProps {
  employee: Employee;
  onUpdateSettings: (
    employeeId: string, 
    updates: {
      dailyCapacity?: number;
      shiftStart?: string;
      shiftEnd?: string;
      role?: "Teacher" | "Para-Educator";
    }
  ) => void;
}

export function StaffCard({ employee, onUpdateSettings }: StaffCardProps) {
  const router = useRouter();
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleViewSchedule = () => {
    // Updated route to match the new staff-specific schedule page
    router.push(`/dashboard/staff/${employee.id}`);
    console.log('Employee ID:', employee.id)
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{employee.name}</h3>
              <p className="text-sm text-muted-foreground">{employee.role}</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setEditModalOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                onClick={handleViewSchedule}
                className="gap-2"
              >
                View Schedule
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>
                {employee.shiftStart || "09:00"} - {employee.shiftEnd || "17:00"}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Daily Capacity: {Math.floor((employee.dailyCapacity || 480) / 60)}h {(employee.dailyCapacity || 480) % 60}m
            </div>
          </div>
        </CardContent>
      </Card>

      <StaffEditModal 
        employee={employee}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={onUpdateSettings}
      />
    </>
  );
}