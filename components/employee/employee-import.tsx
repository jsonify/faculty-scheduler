// components/employee/employee-import.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Check, Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImportValidationError } from '@/lib/types/employee-import';

export function EmployeeImport() {
  const router = useRouter();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<ImportValidationError[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'text/csv') {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      setErrors([]);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/employees/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) throw result;

      if (result.success) {
        toast({
          title: "Import Successful",
          description: `Successfully imported ${result.successfulImports} employees`,
        });
        router.refresh();
      } else {
        setErrors(result.errors);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import employees",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Import Employees</h3>
          <a 
            href="/sample-employee-import.csv" 
            download 
            className="text-sm text-muted-foreground hover:underline"
          >
            Download Template
          </a>
        </div>

        <div className="grid gap-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
            id="employee-csv-upload"
          />
          <Button
            onClick={() => document.getElementById('employee-csv-upload')?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {isUploading ? 'Uploading...' : 'Upload CSV'}
          </Button>
        </div>

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Import Failed</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-2 text-sm">
                {errors.map((error, index) => (
                  <div key={index}>
                    Row {error.row + 1}: {error.field} - {error.message}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  );
}