"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

type SessionUserWithRole = {
  role?: string;
};

async function checkAdmin() {
  const session = await auth();
  const role = (session?.user as SessionUserWithRole | undefined)?.role;
  return role === "SUPERADMIN" || role === "MODERATOR";
}

export async function createUser(data: {
  email: string;
  name: string;
  role: Role;
  rank: string;
  mlbbId?: string;
  server?: string;
}) {
  if (!(await checkAdmin())) throw new Error("Unauthorized");

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      role: data.role,
      rank: data.rank,
      mlbbId: data.mlbbId || null,
      server: data.server || null,
    },
  });

  revalidatePath("/admin/users");
  return user;
}

export async function updateUser(
  id: string,
  data: {
    email: string;
    name: string;
    role: Role;
    rank: string;
    mlbbId?: string;
    server?: string;
  }
) {
  if (!(await checkAdmin())) throw new Error("Unauthorized");

  const user = await prisma.user.update({
    where: { id },
    data: {
      email: data.email,
      name: data.name,
      role: data.role,
      rank: data.rank,
      mlbbId: data.mlbbId || null,
      server: data.server || null,
    },
  });

  revalidatePath("/admin/users");
  return user;
}

export async function deleteUser(id: string) {
  if (!(await checkAdmin())) throw new Error("Unauthorized");

  // Deleting a user should delete all their cascading records in transaction:
  await prisma.$transaction([
    prisma.teamMember.deleteMany({ where: { userId: id } }),
    prisma.message.deleteMany({ where: { userId: id } }),
    prisma.notification.deleteMany({ where: { userId: id } }),
    prisma.friendship.deleteMany({ where: { OR: [{ userId: id }, { friendId: id }] } }),
    prisma.chatRoomParticipant.deleteMany({ where: { userId: id } }),
    prisma.postReaction.deleteMany({ where: { userId: id } }),
    prisma.comment.deleteMany({ where: { userId: id } }),
    prisma.post.deleteMany({ where: { userId: id } }),
    prisma.user.delete({ where: { id } }),
  ]);

  revalidatePath("/admin/users");
}

export async function toggleBanUser(userId: string) {
  if (!(await checkAdmin())) throw new Error("Unauthorized");

  const userObj = (await prisma.user.findUnique({ where: { id: userId } })) as any;
  if (!userObj) return;

  await prisma.user.update({
    where: { id: userId },
    data: { isBanned: !userObj.isBanned } as any,
  });

  revalidatePath("/admin/users");
}
