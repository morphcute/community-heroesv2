import { SidebarProvider } from "@/components/SidebarProvider";
import { Sidebar } from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session?.user?.email
    ? await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        rank: true,
        role: true,
        notifications: {
          where: { read: false },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })
    : null;

  const topBarUser = session?.user
    ? {
      id: user?.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      rank: user?.rank,
      role: user?.role,
      notifications: user?.notifications || []
    }
    : null;

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen bg-transparent text-foreground">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-10rem] top-[-8rem] h-[26rem] w-[26rem] rounded-full bg-amber-300/10 blur-[110px]" />
          <div className="absolute bottom-[-10rem] right-[-6rem] h-[24rem] w-[24rem] rounded-full bg-cyan-300/10 blur-[120px]" />
        </div>
        <Sidebar user={topBarUser} />
        <div className="relative flex min-w-0 flex-1 flex-col">
          <TopBar user={topBarUser} />
          <main className="custom-scrollbar flex-1 overflow-y-auto px-3 py-3 pb-6 sm:px-4 sm:py-4 sm:pb-6 lg:px-6 lg:py-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
