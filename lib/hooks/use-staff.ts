"use client";

import { useState } from "react";
import { Employee } from "@/types/schedule";
import { MOCK_EMPLOYEES } from "@/lib/mock-data";

export function useStaff() {
  const [staff, setStaff] = useState<Employee[]>(MOCK_EMPLOYEES);

  const updateAvailability = (
    employeeId: string,
    availability: Employee["availability"]
  ) => {
    setStaff((prev) =>
      prev.map((employee) =>
        employee.id === employeeId
          ? { ...employee, availability }
          : employee
      )
    );
  };

  const getStaffMember = (id: string) => {
    return staff.find((employee) => employee.id === id);
  };

  return {
    staff,
    updateAvailability,
    getStaffMember,
  };
}