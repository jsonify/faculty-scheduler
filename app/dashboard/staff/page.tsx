import { StaffList } from "@/components/staff/staff-list";
import { StaffStats } from "@/components/staff/staff-stats";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { EmployeeDialog } from "@/components/dialogs/employee-dialog";
import { UserPlus } from "lucide-react";

export default function StaffPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Faculty Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <EmployeeDialog />
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8">
          <StaffList />
        </div>
        <div className="md:col-span-4">
          <StaffStats />
        </div>
      </div>
    </div>
  );
}