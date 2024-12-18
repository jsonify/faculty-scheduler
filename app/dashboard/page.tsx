import { Calendar } from "@/components/ui/calendar";
import { ScheduleView } from "@/components/schedule-view";
import { CoverageAlert } from "@/components/coverage-alert";

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Staff Scheduling Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3">
          <Calendar mode="single" className="rounded-md border" />
        </div>
        <div className="md:col-span-9">
          <CoverageAlert />
          <ScheduleView />
        </div>
      </div>
    </div>
  );
}