import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/ui/PageShell";
import { UsersClient } from "./UsersClient";

type SessionUserWithRole = {
  role?: string;
};

export default async function AdminUsersPage() {
  const session = await auth();
  const currentUserRole = (session?.user as SessionUserWithRole | undefined)?.role;
  if (currentUserRole !== "SUPERADMIN" && currentUserRole !== "MODERATOR") {
    redirect("/home");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <PageShell size="wide" tone="danger">
      <UsersClient initialUsers={users} currentUserRole={currentUserRole || "USER"} />
    </PageShell>
  );
}
