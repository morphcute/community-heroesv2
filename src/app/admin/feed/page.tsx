import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { MessageSquare } from "lucide-react";
import { PageHero, PageShell, SurfaceCard } from "@/components/ui/PageShell";
import { DeleteButton } from "../components/DeleteButton";

type SessionUserWithRole = {
  role?: string;
};

export default async function AdminFeedPage() {
  const session = await auth();
  const role = (session?.user as SessionUserWithRole | undefined)?.role;
  if (role !== "SUPERADMIN" && role !== "MODERATOR") {
    redirect("/home");
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      _count: {
        select: { comments: true, reactions: true },
      },
    },
  });

  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      post: true,
    },
  });

  async function deletePost(id: string) {
    "use server";
    const session = await auth();
    const role = (session?.user as SessionUserWithRole | undefined)?.role;
    if (role !== "SUPERADMIN" && role !== "MODERATOR") return;

    if (!id) return;

    await prisma.post.delete({ where: { id } });
    revalidatePath("/admin/feed");
  }

  async function deleteComment(id: string) {
    "use server";
    const session = await auth();
    const role = (session?.user as SessionUserWithRole | undefined)?.role;
    if (role !== "SUPERADMIN" && role !== "MODERATOR") return;

    if (!id) return;

    await prisma.comment.delete({ where: { id } });
    revalidatePath("/admin/feed");
  }

  return (
    <PageShell size="wide" tone="danger">
      <PageHero
        eyebrow="Operations Hub"
        icon={<MessageSquare className="h-4 w-4" />}
        title="Moderate Arena Feed"
        description="Monitor community posts and comments, track user shares, and remove inappropriate content."
        stats={[
          { label: "Total Posts", value: posts.length },
          { label: "Total Comments", value: comments.length },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Posts Moderation */}
        <SurfaceCard className="p-0">
          <div className="border-b border-border p-5">
            <h2 className="font-display text-2xl font-black uppercase tracking-[0.08em] text-foreground">Recent Posts</h2>
          </div>
          <div className="divide-y divide-border max-h-[600px] overflow-y-auto custom-scrollbar">
            {posts.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No posts found.</div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="p-5 flex justify-between items-start gap-4 hover:bg-muted/30 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-bold text-foreground">{post.user.name || post.user.email}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-foreground/90 break-words leading-relaxed">{post.content}</p>
                    {post.imageUrl && (
                      <div className="mt-2.5 max-w-[200px] rounded-lg overflow-hidden border border-border">
                        <img src={post.imageUrl} className="object-cover w-full h-24" alt="Post attachment" />
                      </div>
                    )}
                    <div className="mt-3 flex gap-4 text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                      <span>{post._count.reactions} reactions</span>
                      <span>{post._count.comments} comments</span>
                    </div>
                  </div>
                  <DeleteButton id={post.id} action={deletePost} confirmMessage="Are you sure you want to delete this post?" />
                </div>
              ))
            )}
          </div>
        </SurfaceCard>

        {/* Comments Moderation */}
        <SurfaceCard className="p-0">
          <div className="border-b border-border p-5">
            <h2 className="font-display text-2xl font-black uppercase tracking-[0.08em] text-foreground">Recent Comments</h2>
          </div>
          <div className="divide-y divide-border max-h-[600px] overflow-y-auto custom-scrollbar">
            {comments.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No comments found.</div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="p-5 flex justify-between items-start gap-4 hover:bg-muted/30 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-bold text-foreground">{comment.user.name || comment.user.email}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-foreground/90 break-words leading-relaxed">{comment.content}</p>
                    <div className="mt-2 text-[10px] text-muted-foreground truncate">
                      On Post: "{comment.post?.content || "Deleted Post"}"
                    </div>
                  </div>
                  <DeleteButton id={comment.id} action={deleteComment} confirmMessage="Are you sure you want to delete this comment?" />
                </div>
              ))
            )}
          </div>
        </SurfaceCard>
      </div>
    </PageShell>
  );
}
