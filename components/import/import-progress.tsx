// components/import/import-progress.tsx
"use client";

import { Progress } from "@/components/ui/progress";

interface ImportProgressProps {
  progress: number;
}

export function ImportProgress({ progress }: ImportProgressProps) {
  return (
    <div className="space-y-2">
      <Progress value={progress} />
      <p className="text-sm text-center text-muted-foreground">
        Importing employees... {progress}%
      </p>
    </div>
  );
}