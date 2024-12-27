"use client";

import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { Toaster } from "@/components/ui/toaster";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
