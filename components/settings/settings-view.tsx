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
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useScheduleStore } from "@/lib/stores/schedule-store";

const SettingsView = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const { toast } = useToast();
  const { fetchEmployees } = useScheduleStore();

  const handlePurgeTeachers = async () => {
    try {
      setIsPurging(true);
      
// Delete all shifts first due to foreign key constraints
const { error: shiftsError } = await supabase
  .from('shifts')
  .delete()
  .not('id', 'is', null);  // This matches all records

if (shiftsError) throw shiftsError;

// Then delete all teachers
const { error: teachersError } = await supabase
  .from('teachers')
  .delete()
  .not('id', 'is', null);  // This matches all records

      if (teachersError) throw teachersError;

      // Refresh the UI
      await fetchEmployees();

      toast({
        title: "Success",
        description: "All teachers and their schedules have been purged.",
      });
    } catch (error) {
      console.error('Error purging teachers:', error);
      toast({
        title: "Error",
        description: "Failed to purge teachers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPurging(false);
      setIsDialogOpen(false); // Close the dialog after purge is completed
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            Actions here can&apos;t be undone. Please be certain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <AlertDialogTrigger asChild>
    <Button variant="destructive" className="w-full sm:w-auto">
      <Trash2 className="mr-2 h-4 w-4" />
      Purge All Teachers
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete all
        teachers and their schedules from the database.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction
        onClick={handlePurgeTeachers}
        disabled={isPurging}
        className="bg-destructive hover:bg-destructive/90"
      >
        {isPurging ? "Purging..." : "Yes, delete everything"}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Tip: You can use the seed script to restore sample data after purging.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export { SettingsView };