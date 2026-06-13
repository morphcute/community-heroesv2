"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPost(content: string, imageUrl?: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Unauthorized" };

  if (!content.trim()) return { ok: false, error: "Content is required" };

  try {
    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        imageUrl: imageUrl?.trim() || null,
        userId
      }
    });
    revalidatePath("/feed");
    return { ok: true, post };
  } catch (error) {
    return { ok: false, error: "Failed to create post" };
  }
}

export async function addComment(postId: string, content: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Unauthorized" };

  if (!content.trim()) return { ok: false, error: "Comment content is required" };

  try {
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        userId
      }
    });
    revalidatePath("/feed");
    return { ok: true, comment };
  } catch (error) {
    return { ok: false, error: "Failed to add comment" };
  }
}

export async function toggleReaction(postId: string, type: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Unauthorized" };

  try {
    const existing = await prisma.postReaction.findUnique({
      where: {
        postId_userId_type: {
          postId,
          userId,
          type
        }
      }
    });

    if (existing) {
      // Toggle off: delete
      await prisma.postReaction.delete({
        where: {
          id: existing.id
        }
      });
    } else {
      // Toggle on: create
      await prisma.postReaction.create({
        data: {
          postId,
          userId,
          type
        }
      });
    }

    revalidatePath("/feed");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "Failed to toggle reaction" };
  }
}
