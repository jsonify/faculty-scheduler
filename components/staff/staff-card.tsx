"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Employee } from "@/types/schedule";
import { Clock } from "lucide-react";
import { BUSINESS_HOURS } from "@/lib/constants";
import { useRouter } from "next/navigation";

type StaffCardProps = {
  employee: Employee;
};

export function StaffCard({ employee }: StaffCardProps) {
  const router = useRouter();
  const activeBlocks = employee.schedule.filter(block => block.isActive);
  
  // Sort blocks by hour to ensure consistent ordering
  const sortedBlocks = [...activeBlocks].sort((a, b) => a.hour - b.hour);
  
  const formatHour = (hour: number) => {
    return `${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
  };

  // Calculate schedule display only if there are active blocks
  const scheduleDisplay = sortedBlocks.length > 0
    ? `${formatHour(sortedBlocks[0].hour)} - ${formatHour(sortedBlocks[sortedBlocks.length - 1].hour)}`
    : "No hours scheduled";

  const handleViewSchedule = () => {
    router.push(`/dashboard/staff/${employee.id}`);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{employee.name}</h3>
            <p className="text-sm text-muted-foreground">{employee.role}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleViewSchedule}
          >
            View Schedule
          </Button>
        </div>
        
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{scheduleDisplay}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}