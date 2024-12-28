// app/dashboard/page.tsx
"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScheduleStore } from "@/lib/stores/schedule-store";
import { getCurrentHourCoverage } from "@/lib/utils/schedule";
import { CoverageAlert } from "@/components/coverage-alert";
import { StaffOverview } from "@/components/staff-overview";
import { DailySchedule } from "@/components/daily-schedule/daily-schedule";

export function DashboardPage() {
  console.log('Rendering DashboardPage');
  const { employees } = useScheduleStore();
  const { activeStaff, totalStaff } = getCurrentHourCoverage(employees);
  console.log('Employees:', employees);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Staff Scheduling Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="md:col-span-3 space-y-6">
          <StaffOverview />
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-9 space-y-6">
          <CoverageAlert />
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Staff
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activeStaff} / {totalStaff}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Support Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {/* This will be connected to real data */}
                  85%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {/* This will be connected to real data */}
                  3
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Schedule Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <DailySchedule />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
