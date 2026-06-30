"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "@/components/SidebarProvider";

export function AdminMobileToggle() {
  const { toggle } = useSidebar();
  return (
    <button
      onClick={toggle}
      className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-95"
      aria-label="Toggle sidebar"
    >
      <Menu className="w-6 h-6" />
    </button>
  );
}
