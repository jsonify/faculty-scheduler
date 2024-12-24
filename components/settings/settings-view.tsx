"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Archive, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useScheduleStore } from "@/lib/stores/schedule-store";

// Enum for purge levels
enum PurgeLevel {
  SOFT = "soft",
  HARD = "hard",
  COMPLETE = "complete"
}

// Enum for employee roles
enum EmployeeRole {
  TEACHER = "teacher",
  PARA_EDUCATOR = "para-educator",
  ALL = "all"
}

const SettingsView = () => {
  const [purgeLevel, setPurgeLevel] = useState<PurgeLevel>(PurgeLevel.SOFT);
  const [employeeRole, setEmployeeRole] = useState<EmployeeRole>(EmployeeRole.ALL);
  const [backupBefore, setBackupBefore] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const { toast } = useToast();
  const { fetchEmployees } = useScheduleStore();

  // Backup data before purging
  const backupData = async () => {
    try {
      // Fetch all relevant tables
      const tables = ['employees', 'shifts', 'students', 'para_assignments'];
      const backupData: Record<string, any[]> = {};

      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) throw error;
        backupData[table] = data;
      }

      // Create a downloadable backup file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system_backup_${new Date().toISOString().replace(/:/g, '-')}.json`;
      a.click();
      window.URL.revokeObjectURL(url);

      return backupData;
    } catch (error) {
      console.error('Backup failed:', error);
      toast({
        title: "Backup Failed",
        description: "Could not create a backup of the system data.",
        variant: "destructive"
      });
      return null;
    }
  };

  // Purge data with different levels of intensity
  const handlePurgeData = async () => {
    try {
      setIsPurging(true);
      setProgressValue(0);

      // Optional backup
      if (backupBefore) {
        await backupData();
        setProgressValue(10);
      }

      // Build dynamic query based on purge level and role
      let employeeQuery = supabase.from('employees').delete().not('id', 'is', null);
      let shiftQuery = supabase.from('shifts').delete().not('id', 'is', null);

      // Apply role-based filtering if not ALL
      if (employeeRole !== EmployeeRole.ALL) {
        employeeQuery = employeeQuery.eq('role', employeeRole);
        shiftQuery = shiftQuery.eq('role', employeeRole);
      }

      // Soft delete: Mark as inactive instead of hard delete
      if (purgeLevel === PurgeLevel.SOFT) {
        employeeQuery = supabase.from('employees')
          .update({ is_active: false })
          .not('id', 'is', null);
        
        shiftQuery = supabase.from('shifts')
          .update({ is_active: false })
          .not('id', 'is', null);
      }

      // Progress tracking
      setProgressValue(30);

      // Delete shifts first due to foreign key constraints
      const { error: shiftsError } = await shiftQuery;
      if (shiftsError) throw shiftsError;

      setProgressValue(60);

      // Then delete employees
      const { error: employeesError } = await employeeQuery;
      if (employeesError) throw employeesError;

      setProgressValue(90);

      // Refresh the UI and complete
      await fetchEmployees();

      toast({
        title: "Data Purged Successfully",
        description: `${employeeRole} data ${purgeLevel} purge completed.`,
      });

      setProgressValue(100);
    } catch (error) {
      console.error('Purge failed:', error);
      toast({
        title: "Purge Failed",
        description: "An error occurred while purging data.",
        variant: "destructive"
      });
    } finally {
      setIsPurging(false);
      setIsDialogOpen(false);
      setProgressValue(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Advanced options for managing system data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                <Trash2 className="mr-2 h-4 w-4" />
                Manage Data
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Data Management</DialogTitle>
                <DialogDescription>
                  Configure advanced data purge options
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Purge Level</label>
                  <Select 
                    value={purgeLevel} 
                    onValueChange={(value) => setPurgeLevel(value as PurgeLevel)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Purge Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PurgeLevel.SOFT}>Soft Delete (Mark Inactive)</SelectItem>
                      <SelectItem value={PurgeLevel.HARD}>Hard Delete</SelectItem>
                      <SelectItem value={PurgeLevel.COMPLETE}>Complete System Reset</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Employee Role</label>
                  <Select 
                    value={employeeRole} 
                    onValueChange={(value) => setEmployeeRole(value as EmployeeRole)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Employee Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EmployeeRole.ALL}>All Roles</SelectItem>
                      <SelectItem value={EmployeeRole.TEACHER}>Teachers</SelectItem>
                      <SelectItem value={EmployeeRole.PARA_EDUCATOR}>Para-Educators</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="backup" 
                    checked={backupBefore}
                    onCheckedChange={(checked) => setBackupBefore(!!checked)}
                  />
                  <label 
                    htmlFor="backup" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Backup Data Before Purge
                  </label>
                </div>

                {isPurging && (
                  <Progress value={progressValue} className="w-full" />
                )}
              </div>

              <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="w-full mt-4"
                    disabled={isPurging}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isPurging ? "Purging..." : "Purge Data"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will {purgeLevel} delete {employeeRole} data. 
                      {backupBefore ? " A backup will be created before deletion." : ""}
                      This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handlePurgeData}
                      disabled={isPurging}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isPurging ? "Purging..." : "Confirm Purge"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DialogContent>
          </Dialog>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Tip: Always create a backup before performing destructive operations.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export { SettingsView };