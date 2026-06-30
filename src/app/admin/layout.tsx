import { AdminSidebar } from "./components/AdminSidebar";
import { SidebarProvider } from "@/components/SidebarProvider";
import { AdminTopBar } from "./components/AdminTopBar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calculateUserXP } from "@/lib/xp";

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
    redirect("/home");
  }

  const user = session?.user?.email
    ? await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        rank: true,
        role: true,
        _count: {
          select: {
            participations: true,
            awards: true,
          },
        },
      }
    })
    : null;

  const xp = user ? calculateUserXP({
    participationsCount: user._count.participations,
    awardsCount: user._count.awards,
  }) : null;

  const topBarUser = session?.user
    ? {
      id: user?.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      rank: user?.rank,
      role: user?.role,
      level: xp?.level ?? null,
      xpPercentage: xp?.xpPercentage ?? null,
    }
    : null;

  const logoSetting = await prisma.systemSetting.findUnique({ where: { key: "logo_url" } });
  const logoUrl = logoSetting?.value || "/ch-logo.png";

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen overflow-hidden bg-transparent text-foreground">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-10rem] top-[-6rem] h-[24rem] w-[24rem] rounded-full bg-red-400/10 blur-[110px]" />
          <div className="absolute bottom-[-10rem] right-[-8rem] h-[28rem] w-[28rem] rounded-full bg-amber-300/8 blur-[130px]" />
        </div>
        <AdminSidebar user={topBarUser} logoUrl={logoUrl} />
        <div className="relative flex min-w-0 flex-1 flex-col lg:ml-64">
          <AdminTopBar user={topBarUser} />
          <main className="custom-scrollbar flex-1 overflow-y-auto p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
