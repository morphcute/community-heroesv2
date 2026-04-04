"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "@/components/SidebarProvider";

export function AdminMobileToggle() {
  const { toggle } = useSidebar();
  return (
    <button
      onClick={toggle}
      className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-95"
      aria-label="Toggle sidebar"
    >
      <Menu className="w-6 h-6" />
    </button>
  );
}
