"use client";

import { useState } from "react";
import { Employee, Shift } from "@/types/schedule";
import { MOCK_EMPLOYEES } from "@/lib/mock-data";

export function useSchedule() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const addShift = (newShift: Omit<Shift, "id">) => {
    const shift: Shift = {
      ...newShift,
      id: Math.random().toString(36).substr(2, 9),
    };
    setShifts((prev) => [...prev, shift]);
  };

  const removeShift = (shiftId: string) => {
    setShifts((prev) => prev.filter((shift) => shift.id !== shiftId));
  };

  const updateShift = (shiftId: string, updates: Partial<Shift>) => {
    setShifts((prev) =>
      prev.map((shift) =>
        shift.id === shiftId ? { ...shift, ...updates } : shift
      )
    );
  };

  return {
    shifts,
    selectedDate,
    setSelectedDate,
    addShift,
    removeShift,
    updateShift,
  };
}