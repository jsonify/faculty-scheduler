"use client";

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { AddShiftForm } from "@/components/forms/add-shift-form";

export function ShiftDialog() {
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add New Shift</DialogTitle>
      </DialogHeader>
      <AddShiftForm />
      <DialogClose id="add-shift-dialog-close" className="hidden" />
    </DialogContent>
  );
}