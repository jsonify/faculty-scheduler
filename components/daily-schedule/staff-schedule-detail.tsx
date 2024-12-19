"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, addDays, subDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Employee } from "@/types/schedule";
import { ChevronLeft, ChevronRight, Clock, ArrowLeft } from "lucide-react";
import { BUSINESS_HOURS } from "@/lib/constants";

export default function StaffScheduleDetail({ employee }: { employee: Employee }) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Format daily capacity for display
  const formatCapacity = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  };

  const activeHours = employee.schedule
    .filter(block => block.isActive)
    .map(block => ({
      hour: block.hour,
      formatted: `${block.hour % 12 || 12}:00 ${block.hour < 12 ? 'AM' : 'PM'}`
    }));

  const totalScheduledMinutes = activeHours.length * 60;
  const dailyCapacity = employee.dailyCapacity || 480; // Default to 8 hours
  const remainingMinutes = dailyCapacity - totalScheduledMinutes;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Staff List
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{employee.name}&apos;s Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Daily Capacity:</span>
                <span className="font-medium">{formatCapacity(dailyCapacity)}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Scheduled:</span>
                <span className="font-medium">{formatCapacity(totalScheduledMinutes)}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Remaining:</span>
                <span className={`font-medium ${remainingMinutes < 0 ? 'text-destructive' : ''}`}>
                  {formatCapacity(Math.abs(remainingMinutes))}
                  {remainingMinutes < 0 ? ' over capacity' : ''}
                </span>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Today&apos;s Schedule</h4>
                <div className="space-y-3">
                  {activeHours.map(({ hour, formatted }) => (
                    <div key={hour} className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatted}</span>
                      <div className="flex-1 h-2 bg-primary/10 rounded-full" />
                    </div>
                  ))}
                  {activeHours.length === 0 && (
                    <p className="text-sm text-muted-foreground">No hours scheduled for today</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}