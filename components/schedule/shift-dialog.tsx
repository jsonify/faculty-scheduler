"use client";

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddShiftForm } from "@/components/forms/add-shift-form";

export function ShiftDialog() {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Shift</DialogTitle>
      </DialogHeader>
      <AddShiftForm />
    </DialogContent>
  );
}