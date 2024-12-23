"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface AddEmployeeFormProps {
  onClose: () => void;
}

export function AddEmployeeForm({ onClose }: AddEmployeeFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isFlexible, setIsFlexible] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [availability, setAvailability] = useState([
    { dayOfWeek: 1, enabled: false, startTime: '09:00', endTime: '15:00' },
    { dayOfWeek: 2, enabled: false, startTime: '09:00', endTime: '15:00' },
    { dayOfWeek: 3, enabled: false, startTime: '09:00', endTime: '15:00' },
    { dayOfWeek: 4, enabled: false, startTime: '09:00', endTime: '15:00' },
    { dayOfWeek: 5, enabled: false, startTime: '09:00', endTime: '15:00' },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          role,
          scheduleType: isFlexible ? 'flexible' : 'fixed',
          defaultStartTime: isFlexible ? null : '08:00',
          defaultEndTime: isFlexible ? null : '17:00',
          availability: isFlexible ? availability : null
        })
      });

      if (!response.ok) throw new Error('Failed to create employee');

      toast({ title: "Success", description: "Employee added successfully" });
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({ 
        title: "Error",
        description: "Failed to add employee",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input 
            required 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div>
          <Label>Role</Label>
          <Select value={role} onValueChange={setRole} required>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="para-educator">Para-Educator</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch 
            checked={isFlexible} 
            onCheckedChange={setIsFlexible} 
          />
          <Label>Flexible Schedule</Label>
        </div>

        {isFlexible && (
          <div className="space-y-4">
            {availability.map((day, index) => (
              <div key={day.dayOfWeek} className="flex items-center space-x-4">
                <Switch
                  checked={day.enabled}
                  onCheckedChange={(checked) => {
                    const newAvailability = [...availability];
                    newAvailability[index].enabled = checked;
                    setAvailability(newAvailability);
                  }}
                />
                <span className="w-20">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.dayOfWeek]}
                </span>
                <Input
                  type="time"
                  value={day.startTime}
                  onChange={(e) => {
                    const newAvailability = [...availability];
                    newAvailability[index].startTime = e.target.value;
                    setAvailability(newAvailability);
                  }}
                  disabled={!day.enabled}
                />
                <Input
                  type="time"
                  value={day.endTime}
                  onChange={(e) => {
                    const newAvailability = [...availability];
                    newAvailability[index].endTime = e.target.value;
                    setAvailability(newAvailability);
                  }}
                  disabled={!day.enabled}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" className="w-full">
        Add Employee
      </Button>
    </form>
  );
}