"use client";

import { useState } from "react";
import { StaffCard } from "@/components/staff/staff-card";
import { useScheduleStore } from "@/lib/stores/schedule-store";
import { Input } from "@/components/ui/input";
import { Employee } from "@/types/schedule";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export function StaffList() {
  // State for search and filter functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "Teacher" | "Para-Educator">("all");
  
  // Get employees and the update function from our store
  const { employees, loading, error, updateEmployeeSettings } = useScheduleStore();

  // Filter employees based on search term and role
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || employee.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Handle employee updates
  const handleEmployeeUpdate = async (
    employeeId: string, 
    updates: Partial<Employee>
  ) => {
    await updateEmployeeSettings(employeeId, updates);
  };

  // If we're loading, show a loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-muted animate-pulse rounded-lg" />
        <div className="h-20 bg-muted animate-pulse rounded-lg" />
        <div className="h-20 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  // If we have an error, show it
  if (error) {
    return (
      <div className="p-4 border border-destructive text-destructive rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search staff..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select
          value={roleFilter}
          onValueChange={(value) => setRoleFilter(value as typeof roleFilter)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Teacher">Teachers</SelectItem>
            <SelectItem value="Para-Educator">Para-Educators</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Staff List */}
      {filteredEmployees.length > 0 ? (
        <div className="space-y-4">
          {filteredEmployees.map((employee) => (
            <StaffCard
              key={employee.id}
              employee={employee}
              onUpdate={(updates) => handleEmployeeUpdate(employee.id, updates)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center p-8 text-muted-foreground">
          No staff members found matching your search criteria
        </div>
      )}
    </div>
  );
}