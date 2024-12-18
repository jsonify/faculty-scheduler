import { DailyScheduleClient } from "@/components/daily-schedule/daily-schedule-client";

export default function DailySchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Daily Schedule</h1>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-12">
          <DailyScheduleClient />
        </div>
      </div>
    </div>
  );
}