// components/calendar/day-schedule.tsx
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Employee } from "@/types/database";
import { TimeSlot } from "@/components/calendar/time-slot";

interface DayScheduleProps {
  date: Date;
}

export function DaySchedule({ date }: DayScheduleProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSchedules() {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          shifts!inner (
            start_time,
            end_time
          )
        `)
        .eq('shifts.date', formattedDate);

      if (!error && data) {
        setEmployees(data);
      }
      setLoading(false);
    }

    fetchSchedules();
  }, [date]);

  if (loading) {
    return <Card className="p-4">Loading schedules...</Card>;
  }

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        {format(date, 'MMMM d, yyyy')}
      </h2>
      
      <div className="space-y-4">
        {employees.map((employee) => (
          <TimeSlot 
            key={employee.id}
            employee={employee}
            date={date}
          />
        ))}
      </div>
    </Card>
  );
}