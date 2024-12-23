// components/coverage-alert.tsx
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { useScheduleStore } from "@/lib/stores/schedule-store";

interface CoverageStatus {
 status: "success" | "warning" | "error";
 message: string;
}

export function CoverageAlert() {
 const { employees } = useScheduleStore();

 // Calculate coverage metrics
 const getCoverageStatus = (): CoverageStatus => {
   const activeStaff = employees.filter(e => 
     e.schedule.some(block => block.isActive)
   ).length;

   const supportStaff = employees.filter(e => 
     e.role === "Para-Educator" && 
     e.schedule.some(block => block.isActive)
   ).length;

   if (activeStaff < 3) {
     return {
       status: "error",
       message: `Critical understaffing: Only ${activeStaff} staff members active`
     };
   }

   if (supportStaff < 2) {
     return {
       status: "warning",
       message: `Limited support coverage: ${supportStaff} para-educators available`
     };
   }

   return {
     status: "success",
     message: "Full coverage with adequate support staff"
   };
 };

 const coverage = getCoverageStatus();

 return (
   <Alert 
     variant={coverage.status === "success" ? "default" : "destructive"} 
     className="mb-6"
   >
     {coverage.status === "success" ? (
       <CheckCircle className="h-4 w-4" />
     ) : (
       <AlertTriangle className="h-4 w-4" />
     )}
     <AlertTitle>Coverage Status</AlertTitle>
     <AlertDescription>{coverage.message}</AlertDescription>
   </Alert>
 );
}