// components/import/employee-import.tsx
"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { ImportPreview } from "./import-preview";
import { ImportProgress } from "./import-progress";
import { ImportErrors } from "./import-errors";
import Papa from "papaparse";
import { validateEmployeeData } from "@/lib/utils/employee-validator";
import { downloadTemplate } from '@/lib/utils/csv-export';

type ImportState = "idle" | "preview" | "importing" | "complete" | "error";

export function EmployeeImport() {
  const [state, setState] = useState<ImportState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<any[]>([]);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setFile(file);
    setState("preview");

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const validation = validateEmployeeData(results.data);
        if (validation.errors.length > 0) {
          setErrors(validation.errors);
          setState("error");
          return;
        }
        setPreview(validation.data);
      },
      error: (error) => {
        toast({
          title: "Error",
          description: "Failed to parse CSV file",
          variant: "destructive",
        });
      }
    });
  };

  const handleImport = async () => {
    setState("importing");
    setProgress(0);
    
    try {
      const totalRows = preview.length;
      
      for (let i = 0; i < totalRows; i++) {
        // Process each row
        await processEmployeeRow(preview[i]);
        setProgress(Math.round(((i + 1) / totalRows) * 100));
      }

      setState("complete");
      toast({
        title: "Success",
        description: `Imported ${totalRows} employees successfully`,
      });
    } catch (error) {
      setState("error");
      toast({
        title: "Error",
        description: "Failed to import employees",
        variant: "destructive",
      });
    }
  };

  const processEmployeeRow = async (row: any) => {
    // Implementation of actual employee creation
    // This would call your API endpoint to create the employee
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {state === "idle" && (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center p-8">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-4">
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload CSV file
                  </span>
                </div>
              </label>
            </div>
            
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => downloadTemplate(false)}
              >
                Download Template
              </Button>
              <Button 
                variant="outline" 
                onClick={() => downloadTemplate(true)}
              >
                Download Example
              </Button>
            </div>
          </div>
        )}
  
        {state === "preview" && preview.length > 0 && (
          <div className="space-y-4">
            <ImportPreview data={preview} />
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setState("idle")}>
                Cancel
              </Button>
              <Button onClick={handleImport}>
                Import {preview.length} Employees
              </Button>
            </div>
          </div>
        )}
  
        {state === "importing" && (
          <ImportProgress progress={progress} />
        )}
  
        {state === "error" && errors.length > 0 && (
          <ImportErrors errors={errors} onRetry={() => setState("preview")} />
        )}
      </div>
    </Card>
  )
};