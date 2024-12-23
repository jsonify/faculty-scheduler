// components/staff-overview.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScheduleStore } from "@/lib/stores/schedule-store";
import { BUSINESS_HOURS } from "@/lib/constants";

export function StaffOverview() {
 const { employees } = useScheduleStore();

 // Calculate key metrics
 const metrics = {
   totalStaff: employees.length,
   activeTeachers: employees.filter(e => 
     e.role === "teacher" && e.schedule.some(block => block.isActive)
   ).length,
   activeParas: employees.filter(e => 
     e.role === "para-educator" && e.schedule.some(block => block.isActive)
   ).length,
   staffWithFullSchedule: employees.filter(e => {
     const activeHours = e.schedule.filter(block => block.isActive).length;
     return activeHours >= BUSINESS_HOURS.MIN_HOURS;
   }).length
 };

 const coveragePercentage = (metrics.staffWithFullSchedule / metrics.totalStaff) * 100;

 return (
   <Card>
     <CardHeader>
       <CardTitle>Staff Overview</CardTitle>
     </CardHeader>
     <CardContent className="space-y-4">
       <div>
         <p className="text-sm font-medium">Total Staff</p>
         <p className="text-2xl font-bold">{metrics.totalStaff}</p>
       </div>
       
       <div className="grid grid-cols-2 gap-4">
         <div>
           <p className="text-sm font-medium">Teachers</p>
           <p className="text-xl font-bold">{metrics.activeTeachers}</p>
         </div>
         <div>
           <p className="text-sm font-medium">Para-Educators</p>
           <p className="text-xl font-bold">{metrics.activeParas}</p>
         </div>
       </div>

       <div>
         <p className="text-sm font-medium">Schedule Coverage</p>
         <p className="text-2xl font-bold">{coveragePercentage.toFixed(1)}%</p>
         <p className="text-sm text-muted-foreground">
           {metrics.staffWithFullSchedule} staff with {BUSINESS_HOURS.MIN_HOURS}+ hours
         </p>
       </div>
     </CardContent>
   </Card>
 );
}