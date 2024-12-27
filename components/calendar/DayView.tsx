"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Employee, Student } from "@/types/schedule";
import { BUSINESS_HOURS } from "@/lib/constants";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DayViewProps {
  date: Date;
  paraEducators: Employee[];
}

export function DayView({ date, paraEducators }: DayViewProps) {
  // Format the date for display
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate coverage statistics
  const totalParas = paraEducators.length;
  const availableParas = paraEducators.filter(para => para.isAvailable).length;

  // Generate time slots for the day
  const timeSlots = Array.from(
    { length: BUSINESS_HOURS.END - BUSINESS_HOURS.START },
    (_, index) => BUSINESS_HOURS.START + index
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{formattedDate}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Coverage Alert */}
          <Alert 
            variant={availableParas < totalParas ? "destructive" : "default"}
            className="mb-4"
          >
            {availableParas < totalParas ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {availableParas} of {totalParas} para-educators available
            </AlertDescription>
          </Alert>

          {/* Schedule Grid */}
          <div className="relative border rounded-md">
            {/* Time column */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-background border-r">
              {timeSlots.map(hour => (
                <div 
                  key={hour}
                  className="h-16 flex items-center justify-center border-b text-sm"
                >
                  {hour % 12 || 12}:00 {hour < 12 ? 'AM' : 'PM'}
                </div>
              ))}
            </div>

            {/* Schedule grid */}
            <div className="ml-20">
              {/* Para-educator rows */}
              {paraEducators.map(para => (
                <div 
                  key={para.id}
                  className={cn(
                    "border-b last:border-b-0",
                    !para.isAvailable && "bg-muted/50"
                  )}
                >
                  {timeSlots.map(hour => {
                    const block = para.schedule?.find(b => b.hour === hour);
                    return (
                      <div 
                        key={hour}
                        className={cn(
                          "h-16 border-b px-4 py-2",
                          block?.isActive && "bg-primary/10"
                        )}
                      >
                        {block?.isActive && para.currentAssignment && (
                          <div className="text-xs font-medium">
                            {para.currentAssignment ? "Supporting student" : "Available"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
