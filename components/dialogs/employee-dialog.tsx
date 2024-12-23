"use client";

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { AddEmployeeForm } from "@/components/forms/add-employee-form";

export function EmployeeDialog() {
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add New Employee</DialogTitle>
      </DialogHeader>
      <AddEmployeeForm />
      <DialogClose id="add-employee-dialog-close" className="hidden" />
    </DialogContent>
  );
}