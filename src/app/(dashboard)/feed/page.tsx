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

  // Fetch suggested players from user table (excluding current user)
  const suggestedUsers = await prisma.user.findMany({
    where: {
      id: { not: currentUserId }
    },
    take: 5,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      rank: true
    }
  });

  const suggestedPlayers = suggestedUsers.map(u => ({
    id: u.id,
    name: u.name || u.email?.split("@")[0] || "Player",
    rank: u.rank || "Rookie",
    mutual: Math.floor(Math.random() * 3)
  }));

  // Fetch trending tags by parsing hashtags in actual database posts
  const allPosts = await prisma.post.findMany({ select: { content: true } });
  const tagCounts: { [key: string]: number } = {};
  const hashTagRegex = /#(\w+)/g;
  for (const post of allPosts) {
    let match;
    hashTagRegex.lastIndex = 0;
    const seenInPost = new Set<string>();
    while ((match = hashTagRegex.exec(post.content)) !== null) {
      const tag = match[1];
      if (tag && !seenInPost.has(tag)) {
        seenInPost.add(tag);
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
  }
  const trendingTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(item => ({ tag: item.tag, count: `${item.count} posts` }));

  // Query live stats
  const activePlayersCount = await prisma.user.count();
  const scrimsTodayCount = await prisma.scrim.count({
    where: {
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    }
  });
  const tournamentsLiveCount = await prisma.tournament.count({
    where: {
      status: "ONGOING"
    }
  });

  return (
    <FeedClient 
      initialPosts={serializedPosts} 
      currentUserId={currentUserId} 
      suggestedPlayers={suggestedPlayers}
      trendingTags={trendingTags}
      activePlayers={activePlayersCount}
      scrimsToday={scrimsTodayCount}
      tournamentsLive={tournamentsLiveCount}
    />
  );
}
