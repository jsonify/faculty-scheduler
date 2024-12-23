// components/coverage-alert.tsx

"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { useScheduleStore } from "@/lib/stores/schedule-store";

type CoverageStatus = {
  status: "optimal" | "warning";
  message: string;
};

export function CoverageAlert() {
  const { employees } = useScheduleStore();

  const getCoverageStatus = (): CoverageStatus => {
    if (!employees?.length) {
      return {
        status: "warning",
        message: "No employees found"
      };
    }

    const activeStaff = employees.filter(e => 
      e.schedule?.some(block => block.isActive)
    ).length;

    const supportStaff = employees.filter(e => 
      e.role === "Para-Educator" && 
      e.schedule?.some(block => block.isActive)
    ).length;

    if (activeStaff < 3 || supportStaff < 1) {
      return {
        status: "warning",
        message: `Current coverage: ${activeStaff} staff (${supportStaff} support staff)`
      };
    }

    return {
      status: "optimal",
      message: "Staff coverage is optimal"
    };
  };

  const coverage = getCoverageStatus();

  return (
    <Alert variant={coverage.status === "warning" ? "destructive" : "default"} className="mb-6">
      {coverage.status === "warning" ? (
        <AlertTriangle className="h-4 w-4" />
      ) : (
        <CheckCircle className="h-4 w-4" />
      )}
      <AlertTitle>Coverage Status</AlertTitle>
      <AlertDescription>{coverage.message}</AlertDescription>
    </Alert>
  );
}