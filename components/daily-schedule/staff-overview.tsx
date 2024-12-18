"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScheduleStore } from "@/lib/stores/schedule-store";
import { getCurrentHourCoverage } from "@/lib/utils/schedule";

export function StaffOverview() {
  const { employees } = useScheduleStore();
  const { activeStaff, totalStaff } = getCurrentHourCoverage(employees);
  const coverageStatus = activeStaff >= 3 ? "Optimal Coverage" : "Understaffed";
  const statusColor = activeStaff >= 3 ? "text-green-600" : "text-destructive";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Coverage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Active Staff</p>
            <p className="text-2xl font-bold">
              {activeStaff} / {totalStaff}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Coverage Status</p>
            <p className={`text-lg font-medium ${statusColor}`}>
              {coverageStatus}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}