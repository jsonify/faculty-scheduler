// components/forms/add-shift-form.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

type Employee = {
  id: string;
  name: string;
  role: string;
};

export function AddShiftForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    employeeId: "",
    date: new Date().toISOString().split('T')[0],
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    async function fetchEmployees() {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching employees:', error);
        toast({
          title: "Error",
          description: "Failed to load employees",
          variant: "destructive",
        });
      } else if (data) {
        setEmployees(data);
      }
    }

    fetchEmployees();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employeeId || !formData.date || !formData.startTime || !formData.endTime) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('shifts')
        .insert([{
          employee_id: formData.employeeId,
          date: formData.date,
          start_time: formData.startTime,
          end_time: formData.endTime,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Shift added successfully",
      });

      router.refresh();
      
      const closeButton = document.getElementById('add-shift-dialog-close');
      if (closeButton) {
        closeButton.click();
      }
      
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add shift",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="employee">Employee</Label>
        <Select onValueChange={(value) => setFormData({ ...formData, employeeId: value })} required>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select employee" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name} ({employee.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full">Add Shift</Button>
    </form>
  );
}