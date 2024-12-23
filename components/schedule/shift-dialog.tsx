// components/schedule/shift-dialog.tsx
"use client";

import {
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useScheduleStore } from "@/lib/stores/schedule-store";

export function ShiftDialog() {
 const { employees } = useScheduleStore();
 const { toast } = useToast();

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   
   toast({
     title: "Success",
     description: "Shift added successfully",
   });

   const closeButton = document.getElementById('shift-dialog-close');
   if (closeButton) {
     closeButton.click();
   }
 };

 return (
   <DialogContent className="sm:max-w-[425px]">
     <DialogHeader>
       <DialogTitle>Add New Shift</DialogTitle>
     </DialogHeader>
     
     <form onSubmit={handleSubmit} className="space-y-4">
       <div className="space-y-2">
         <Label htmlFor="employee">Employee</Label>
         <Select>
           <SelectTrigger>
             <SelectValue placeholder="Select employee" />
           </SelectTrigger>
           <SelectContent>
             {employees.map((employee) => (
               <SelectItem key={employee.id} value={employee.id}>
                 {employee.name}
               </SelectItem>
             ))}
           </SelectContent>
         </Select>
       </div>

       <div className="grid grid-cols-2 gap-4">
         <div className="space-y-2">
           <Label htmlFor="startTime">Start Time</Label>
           <Input id="startTime" type="time" required />
         </div>
         <div className="space-y-2">
           <Label htmlFor="endTime">End Time</Label>
           <Input id="endTime" type="time" required />
         </div>
       </div>

       <Button type="submit" className="w-full">Add Shift</Button>
     </form>

     <DialogClose id="shift-dialog-close" className="hidden" />
   </DialogContent>
 );
}