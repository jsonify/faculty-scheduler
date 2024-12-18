import { MOCK_EMPLOYEES } from "@/lib/mock-data";
import StaffScheduleClient from "./staff-schedule-client";

export function generateStaticParams() {
  return MOCK_EMPLOYEES.map((employee) => ({
    id: employee.id,
  }));
}

export default function StaffSchedulePage({ params }: { params: { id: string } }) {
  const employee = MOCK_EMPLOYEES.find(e => e.id === params.id);
  
  if (!employee) {
    return <div>Employee not found</div>;
  }

  return <StaffScheduleClient employee={employee} />;
}