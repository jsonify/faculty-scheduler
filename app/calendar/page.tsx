import { redirect } from 'next/navigation';
import { DaySchedule } from '@/components/calendar/day-schedule';
import { getEmployees } from '@/lib/actions/employee';
import { parseISO } from 'date-fns';

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const date = searchParams.date ? parseISO(searchParams.date) : new Date();
  
  // Fetch para-educators
  const paraEducators = await getEmployees('para-educator');
  
  return (
    <div className="container mx-auto p-4">
      <DayView 
        date={date}
        paraEducators={paraEducators}
      />
    </div>
  );
}
