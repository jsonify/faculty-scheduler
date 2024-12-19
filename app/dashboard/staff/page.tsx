"use client";

import { StaffList } from "@/components/staff/staff-list";
import { StaffStats } from "@/components/staff/staff-stats";

export default function StaffPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Faculty Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8">
          <StaffList />
        </div>
        <div className="md:col-span-4">
          <StaffStats />
        </div>
      </div>
    </div>
  );
}