// components/import/import-preview.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ImportPreviewProps {
  data: any[];
}

export function ImportPreview({ data }: ImportPreviewProps) {
  if (!data.length) return null;

  const headers = Object.keys(data[0]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.slice(0, 5).map((row, i) => (
            <TableRow key={i}>
              {headers.map((header) => (
                <TableCell key={header}>{row[header]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {data.length > 5 && (
        <div className="p-2 text-sm text-muted-foreground text-center border-t">
          And {data.length - 5} more rows...
        </div>
      )}
    </div>
  );
}