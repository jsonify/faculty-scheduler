import { create } from "zustand";
import { MOCK_EMPLOYEES } from "@/lib/mock-data";
import { Employee } from "@/types/schedule";
import { BUSINESS_HOURS } from "@/lib/constants";

interface ScheduleState {
  employees: Employee[];
  updateEmployeeSchedule: (
    employeeId: string,
    currentHour: number,
    newHour: number
  ) => void;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  employees: MOCK_EMPLOYEES,
  updateEmployeeSchedule: (employeeId, currentHour, newHour) =>
    set((state) => ({
      employees: state.employees.map((employee) => {
        if (employee.id !== employeeId) return employee;

        // Only update if within business hours
        if (newHour < BUSINESS_HOURS.START || newHour >= BUSINESS_HOURS.END) {
          return employee;
        }

        const updatedSchedule = employee.schedule.map((block) => ({
          ...block,
          isActive: block.hour === newHour ? true : 
                   block.hour === currentHour ? false : 
                   block.isActive
        }));

        return {
          ...employee,
          schedule: updatedSchedule,
        };
      }),
    })),
}));