import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import FeedClient from "./FeedClient";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const session = await auth();
  const currentUserId = session?.user?.id;
  if (!currentUserId) {
    redirect("/login");
  }

  // Fetch posts with author, comments, and reactions
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc"
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          rank: true,
          mlbbId: true
        }
      },
      comments: {
        orderBy: {
          createdAt: "asc"
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              rank: true
            }
          }
        }
      },
      reactions: {
        select: {
          id: true,
          userId: true,
          type: true
        }
      }
    }
  });

  const serializedPosts = posts.map(post => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    comments: post.comments.map(comment => ({
      ...comment,
      createdAt: comment.createdAt.toISOString()
    }))
  }));

  return (
    <FeedClient 
      initialPosts={serializedPosts} 
      currentUserId={currentUserId} 
    />
  );
}
