// app/dashboard/staff/page.tsx
"use client";

import { StaffList } from "@/components/staff/staff-list";
import { StaffStats } from "@/components/staff/staff-stats";
import { ExportButton } from "@/components/staff/export-button";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import Link from "next/link";

export default function StaffPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <div className="flex gap-4">
          <ExportButton />
          <Link href="/dashboard/staff/import">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Import Staff
            </Button>
          </Link>
        </div>
      </div>
      
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