// components/ui/time-picker-input.tsx

"use client";

import { Input } from "@/components/ui/input";

interface TimePickerInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

export function TimePickerInput({ value, onChange, id }: TimePickerInputProps) {
  return (
    <Input
      id={id}
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full"
    />
  );
}