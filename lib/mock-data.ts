import { Employee } from "@/types/schedule";
import { BUSINESS_HOURS } from "@/lib/constants";

// Helper to distribute hours randomly across business hours
function generateRandomSchedule() {
  const schedule = Array.from(
    { length: BUSINESS_HOURS.END - BUSINESS_HOURS.START },
    (_, index) => ({
      hour: BUSINESS_HOURS.START + index,
      isActive: false,
    })
  );

  // Randomly activate consecutive hours
  const startIndex = Math.floor(
    Math.random() * (schedule.length - BUSINESS_HOURS.MIN_HOURS)
  );
  const hoursToActivate =
    Math.floor(
      Math.random() * (BUSINESS_HOURS.MAX_HOURS - BUSINESS_HOURS.MIN_HOURS + 1)
    ) + BUSINESS_HOURS.MIN_HOURS;

  for (let i = 0; i < hoursToActivate; i++) {
    if (startIndex + i < schedule.length) {
      schedule[startIndex + i].isActive = true;
    }
  }

  return schedule;
}

// Generate mock UUIDs for our employees
function generateMockUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const MOCK_EMPLOYEES: Employee[] = Array.from(
  { length: 20 },
  (_, i) => ({
    id: generateMockUUID(), // Using UUID format instead of simple numbers
    name: `Teacher ${i + 1}`,
    role: "Teacher",
    schedule: generateRandomSchedule(),
    availability: [],
  })
);
