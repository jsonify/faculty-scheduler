// components/import/import-errors.tsx
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ImportErrorsProps {
  errors: any[];
  onRetry: () => void;
}

export function ImportErrors({ errors, onRetry }: ImportErrorsProps) {
  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Import Failed</AlertTitle>
        <AlertDescription>
          Please correct the following errors and try again.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        {errors.map((error, index) => (
          <div key={index} className="text-sm text-destructive">
            {error.message}
          </div>
        ))}
      </div>

      <Button onClick={onRetry}>Try Again</Button>
    </div>
  );
}