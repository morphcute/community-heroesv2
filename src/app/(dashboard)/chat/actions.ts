"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function sendFriendRequest(friendId: string) {
  const session = await auth();
  const currentUserId = session?.user?.id;
  if (!currentUserId) return { ok: false, message: "Unauthorized login required." };

  if (currentUserId === friendId) {
    return { ok: false, message: "You cannot add yourself as a friend." };
  }

  // Check if target user exists
  const targetUser = await prisma.user.findUnique({ where: { id: friendId } });
  if (!targetUser) return { ok: false, message: "User not found." };

  // Check existing friendship
  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userId: currentUserId, friendId },
        { userId: friendId, friendId: currentUserId }
      ]
    }
  });

  if (existing) {
    if (existing.status === "ACCEPTED") {
      return { ok: false, message: "You are already friends." };
    }
    if (existing.status === "PENDING") {
      if (existing.userId === currentUserId) {
        return { ok: false, message: "Friend request is already pending." };
      } else {
        // The other user already sent a request, let's accept it!
        await prisma.friendship.update({
          where: { id: existing.id },
          data: { status: "ACCEPTED" }
        });
        
        // Auto-create DM room
        await getOrCreateDM(friendId);
        
        revalidatePath("/chat");
        return { ok: true, message: "Friend request accepted!" };
      }
    }
    // If declined, reset to pending
    await prisma.friendship.update({
      where: { id: existing.id },
      data: { status: "PENDING", userId: currentUserId, friendId }
    });
  } else {
    await prisma.friendship.create({
      data: {
        userId: currentUserId,
        friendId,
        status: "PENDING"
      }
    });
  }

  // Create notification
  await prisma.notification.create({
    data: {
      userId: friendId,
      title: "New Friend Request",
      content: `${session?.user?.name || "A player"} sent you a friend request.`,
      link: "/chat"
    }
  });

  revalidatePath("/chat");
  return { ok: true, message: "Friend request sent successfully!" };
}

export async function acceptFriendRequest(requestId: string) {
  const session = await auth();
  const currentUserId = session?.user?.id;
  if (!currentUserId) return { ok: false, message: "Unauthorized login required." };

  const request = await prisma.friendship.findUnique({
    where: { id: requestId }
  });

  if (!request || request.friendId !== currentUserId) {
    return { ok: false, message: "Friend request not found or unauthorized." };
  }

  await prisma.friendship.update({
    where: { id: requestId },
    data: { status: "ACCEPTED" }
  });

  // Auto-create DM room
  await getOrCreateDM(request.userId);

  // Send notification to the sender
  await prisma.notification.create({
    data: {
      userId: request.userId,
      title: "Friend Request Accepted",
      content: `${session?.user?.name || "A player"} accepted your friend request.`,
      link: "/chat"
    }
  });

  revalidatePath("/chat");
  return { ok: true, message: "Friend request accepted!" };
}

export async function declineFriendRequest(requestId: string) {
  const session = await auth();
  const currentUserId = session?.user?.id;
  if (!currentUserId) return { ok: false, message: "Unauthorized." };

  const request = await prisma.friendship.findUnique({
    where: { id: requestId }
  });

  if (!request || request.friendId !== currentUserId) {
    return { ok: false, message: "Friend request not found." };
  }

  await prisma.friendship.delete({
    where: { id: requestId }
  });

  revalidatePath("/chat");
  return { ok: true, message: "Friend request declined." };
}

export async function createGroupChat(name: string, friendIds: string[]) {
  const session = await auth();
  const currentUserId = session?.user?.id;
  if (!currentUserId) return { ok: false, message: "Unauthorized." };

  if (friendIds.length === 0) {
    return { ok: false, message: "Select at least one friend to create a group chat." };
  }

  const chatRoom = await prisma.chatRoom.create({
    data: {
      name: name || "New Group Chat",
      isGroup: true,
      participants: {
        create: [
          { userId: currentUserId },
          ...friendIds.map(id => ({ userId: id }))
        ]
      }
    }
  });

  // Send notifications to all group members
  await Promise.all(
    friendIds.map(id =>
      prisma.notification.create({
        data: {
          userId: id,
          title: "Added to Group Chat",
          content: `${session?.user?.name || "A player"} added you to the group chat "${name || "New Group Chat"}".`,
          link: "/chat"
        }
      })
    )
  );

  revalidatePath("/chat");
  return { ok: true, chatRoomId: chatRoom.id, message: "Group chat created successfully!" };
}

export async function getOrCreateDM(friendId: string) {
  const session = await auth();
  const currentUserId = session?.user?.id;
  if (!currentUserId) throw new Error("Unauthorized");

  // Query DMs
  const existingDM = await prisma.chatRoom.findFirst({
    where: {
      isGroup: false,
      AND: [
        { participants: { some: { userId: currentUserId } } },
        { participants: { some: { userId: friendId } } }
      ]
    }
  });

  if (existingDM) {
    return existingDM.id;
  }

  // Create new DM room
  const newDM = await prisma.chatRoom.create({
    data: {
      isGroup: false,
      participants: {
        create: [
          { userId: currentUserId },
          { userId: friendId }
        ]
      }
    }
  });

  return newDM.id;
}
