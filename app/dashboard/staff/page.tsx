// app/dashboard/staff/page.tsx
"use client";

import { useState } from 'react';
import { StaffList } from "@/components/staff/staff-list";
import { StaffStats } from "@/components/staff/staff-stats";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { EmployeeDialog } from "@/components/dialogs/employee-dialog";
import { UserPlus } from "lucide-react";
import { AddEmployeeForm } from "@/components/forms/add-employee-form";

export default function StaffPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Faculty Management</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Employee</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <AddEmployeeForm onClose={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
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