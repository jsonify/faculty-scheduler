"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/class-utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Calendar, Users, Clock } from "lucide-react";


const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Calendar", href: "/dashboard/calendar", icon: Calendar }, // Add this line
  { name: "Daily Schedule", href: "/dashboard/daily", icon: Clock },
  { name: "Staff", href: "/dashboard/staff", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 border-r h-[calc(100vh-4rem)]">
      <div className="p-4">
        <nav className="space-y-2">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  pathname === item.href && "bg-secondary"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}