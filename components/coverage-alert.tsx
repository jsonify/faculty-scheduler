"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";

export function CoverageAlert() {
  // This would be connected to real-time coverage data
  const coverage = {
    status: "warning",
    message: "Morning shift is understaffed by 1 person",
  };

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