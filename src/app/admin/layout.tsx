import { AdminSidebar } from "./components/AdminSidebar";
import { SidebarProvider } from "@/components/SidebarProvider";
import { AdminMobileToggle } from "./components/AdminMobileToggle";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

type SessionUserWithRole = {
  role?: string;
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as SessionUserWithRole | undefined)?.role;
  if (role !== "SUPERADMIN" && role !== "MODERATOR") {
    redirect("/");
  }

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen overflow-hidden bg-transparent text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-10rem] top-[-6rem] h-[24rem] w-[24rem] rounded-full bg-red-400/10 blur-[110px]" />
          <div className="absolute bottom-[-10rem] right-[-8rem] h-[28rem] w-[28rem] rounded-full bg-amber-300/8 blur-[130px]" />
        </div>
        <AdminSidebar />
        <div className="relative flex min-w-0 flex-1 flex-col lg:ml-64">
          {/* Mobile top bar */}
          <div className="sticky top-0 z-30 flex h-14 items-center border-b border-white/10 bg-black/45 px-4 backdrop-blur-xl lg:hidden">
            <AdminMobileToggle />
            <span className="text-sm font-bold text-white ml-3">CH Admin</span>
          </div>
          <main className="custom-scrollbar flex-1 overflow-y-auto p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
