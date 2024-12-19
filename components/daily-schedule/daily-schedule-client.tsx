"use client";

import { useEffect } from "react";
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import { TimeHeader } from "./time-header";
import { ScheduleGrid } from "./schedule-grid";
import { useScheduleStore } from "@/lib/stores/schedule-store";
import { validateScheduleChange } from "@/lib/utils/schedule";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export function DailyScheduleClient() {
  const { employees, loading, error, fetchEmployees, updateEmployeeSchedule } = useScheduleStore();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    async function loadEmployees() {
      if (mounted) {
        await fetchEmployees();
      }
    }

    loadEmployees();

    // Cleanup function to prevent updates if component unmounts
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array since fetchEmployees is from zustand store

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 5 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const { employeeId, hour: currentHour } = active.data.current || {};
    const [targetEmployeeId, , targetHour] = over.id.toString().split('-');
    const newHour = parseInt(targetHour);

    if (targetEmployeeId !== employeeId) return;

    const validation = validateScheduleChange(employees, employeeId, newHour, currentHour);
    
    if (!validation.isValid) {
      toast({
        title: "Schedule Update Failed",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    updateEmployeeSchedule(employeeId, currentHour, newHour);
    
    toast({
      title: "Schedule Updated",
      description: `Schedule block moved to ${newHour % 12 || 12}:00 ${newHour < 12 ? 'AM' : 'PM'}`,
    });
  };

  if (loading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-[400px] w-full" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4">
        <div className="text-sm text-destructive">{error}</div>
      </Card>
    );
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <TimeHeader />
            <ScheduleGrid employees={employees} />
          </table>
        </div>
      </Card>
    </DndContext>
  );
}