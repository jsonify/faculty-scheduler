"use client";

import { useState, useEffect } from "react";
import { getEmployeesWithAvailability } from "@/lib/actions/employee";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { TimeSlot } from "@/components/schedule/time-slot";
import { ScheduleHeader } from "@/components/schedule/schedule-header";
import { ShiftDialog } from "@/components/schedule/shift-dialog";

import { MOCK_SHIFTS } from "@/constants/mock-shifts";
import { TimeBlock, TimeBlockType } from "@/types/schedule";

export function ScheduleView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [employees, setEmployees] = useState<(Employee & { availability: EmployeeAvailability[] })[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const employeesData = await getEmployeesWithAvailability();
      setEmployees(employeesData);
      
      // Convert availability to time blocks
      const blocks = employeesData.flatMap(employee => {
        console.log(`Employee ${employee.name} availability:`, employee.availability);
        return employee.availability.map(avail => {
          const startHour = parseInt(avail.start_time.split(':')[0]);
          const endHour = parseInt(avail.end_time.split(':')[0]);
          
          // Create a block for each hour in the availability range
          const hours = [];
          for (let hour = startHour; hour < endHour; hour++) {
            hours.push({
              hour,
              isActive: true,
              type: 'work' as TimeBlockType,
              employeeId: employee.id,
              description: `${employee.name}'s shift`,
              location: 'Main Campus'
            });
          }
          return hours;
        }).flat();
      });
      setTimeBlocks(blocks);
    };
    
    fetchData();
  }, []);

  const handleAddShift = () => {
    setDialogOpen(true);
  };

  const handleManageShift = (shiftId: string) => {
    const shift = MOCK_SHIFTS.find(s => s.id === shiftId);
    if (shift) {
      // Convert shift to time blocks
      const blocks: TimeBlock[] = [
        {
          hour: 6,
          isActive: true,
          type: 'work'
        },
        {
          hour: 12,
          isActive: true,
          type: 'lunch'
        },
        // Add more blocks based on shift times
      ];
      setTimeBlocks(blocks);
    }
  };

  const handleAddTimeBlock = (block: TimeBlock) => {
    setTimeBlocks(prev => [...prev, block]);
  };

  const handleUpdateTimeBlock = (index: number, updatedBlock: TimeBlock) => {
    setTimeBlocks(prev => prev.map((block, i) => 
      i === index ? updatedBlock : block
    ));
  };

  return (
    <Card className="p-6">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <ScheduleHeader onAddShift={handleAddShift} />
        
        <div className="grid grid-cols-1 gap-4">
          {MOCK_SHIFTS.map((shift) => (
            <TimeSlot
              key={shift.id}
              startTime={shift.startTime}
              endTime={shift.endTime}
              staffCount={shift.staffCount}
              onManage={() => handleManageShift(shift.id)}
            />
          ))}
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Daily Time Blocks</h3>
            <div className="grid grid-cols-[200px_repeat(24,_minmax(0,_1fr))] gap-px bg-gray-200">
              {/* Header Row */}
              <div className="bg-white sticky top-0 z-10"></div>
              {Array.from({ length: 24 }).map((_, hour) => {
                const displayHour = hour % 12 === 0 ? 12 : hour % 12;
                const ampm = hour < 12 ? 'AM' : 'PM';
                return (
                  <div
                    key={hour}
                    className="bg-white p-2 text-center sticky top-0 z-10 border-b border-gray-200"
                  >
                    <div className="text-sm font-medium">{displayHour}</div>
                    <div className="text-xs text-gray-500">{ampm}</div>
                  </div>
                );
              })}

              {/* Employee Rows */}
              {employees.map((employee) => (
                <div key={employee.id} className="contents">
                  {/* Employee Name */}
                  <div className="bg-white p-2 sticky left-0 z-10">
                    {employee.name}
                  </div>

                  {/* Time Blocks */}
                  {Array.from({ length: 24 }).map((_, hour) => {
                    // Check for both availability and scheduled blocks
                    const availabilityBlock = employee.availability?.find(avail => {
                      const startHour = parseInt(avail.start_time.split(':')[0]);
                      const endHour = parseInt(avail.end_time.split(':')[0]);
                      return hour >= startHour && hour < endHour;
                    });

                    const scheduledBlock = timeBlocks.find(
                      (b) => b.employeeId === employee.id && b.hour === hour
                    );

                    const block = scheduledBlock || (availabilityBlock ? {
                      hour,
                      isActive: true,
                      type: 'availability',
                      employeeId: employee.id,
                      description: 'Available',
                      location: 'Main Campus'
                    } : undefined);

                    const blockColors = {
                      work: 'bg-blue-500/90',
                      break: 'bg-green-500/90',
                      lunch: 'bg-orange-500/90',
                      availability: 'bg-green-100/90' // Light green for availability
                    };

                    return (
                      <div
                        key={hour}
                        className={`bg-white relative ${
                          block ? blockColors[block.type] : ''
                        }`}
                      >
                        {block && (
                          <div className="p-1 text-white">
                            <div className="text-xs capitalize">
                              {block.type}
                            </div>
                            {block.description && (
                              <div className="text-xs truncate">
                                {block.description}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Debug Info */}
            <div className="mt-4 p-4 bg-white border rounded-lg text-sm text-gray-600 space-y-2">
              <div className="font-medium">Debug Information</div>
              <div>Total Employees: {employees.length}</div>
              <div>Total Time Blocks: {timeBlocks.length}</div>
              <div>Current Date: {selectedDate.toLocaleDateString()}</div>
              <div className="mt-2">
                <div className="font-medium">Employee Availability:</div>
                {employees.map(employee => (
                  <div key={employee.id} className="ml-2">
                    {employee.name}: {employee.availability?.length || 0} blocks
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <div className="font-medium">Time Block Types:</div>
                {timeBlocks.reduce((acc, block) => {
                  acc[block.type] = (acc[block.type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)}
              </div>
            </div>
          </div>
        </div>

        <ShiftDialog />
      </Dialog>
    </Card>
  );
}
