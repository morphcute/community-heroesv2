import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { MapPin, Save, User, X } from "lucide-react";
import Link from "next/link";
import RegionSelect from "@/components/ui/RegionSelect";
import { PageHero, PageShell, SurfaceCard } from "@/components/ui/PageShell";

export default async function EditProfilePage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) redirect("/login");

  async function updateProfile(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const mlbbId = formData.get("mlbbId") as string;
    const address = formData.get("address") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const server = formData.get("server") as string;

    const authSession = await auth();
    if (!authSession?.user?.email) return;

    await prisma.user.update({
      where: { email: authSession.user.email },
      data: {
        name: name || undefined,
        mlbbId: mlbbId || null,
        address: address || null,
        phoneNumber: phoneNumber || null,
        server: server || null,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/tournaments");
    redirect("/profile");
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Profile Edit"
        icon={<User className="h-4 w-4" />}
        title="Update your player card"
        description="Refresh your display name, MLBB identity, server, and location details."
      />

      <SurfaceCard className="mx-auto w-full max-w-3xl">
        <form action={updateProfile} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-slate-400">Display Name</label>
              <input required name="name" defaultValue={user.name || ""} type="text" className="input-hud" />
            </div>
            <div className="space-y-2">
              <label className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-slate-400">MLBB ID</label>
              <input name="mlbbId" defaultValue={user.mlbbId || ""} type="text" className="input-hud" />
            </div>
            <div className="space-y-2">
              <label className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-slate-400">Server</label>
              <input name="server" defaultValue={user.server || ""} type="text" className="input-hud" />
            </div>
            <div className="space-y-2">
              <label className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-slate-400">Phone Number</label>
              <input name="phoneNumber" defaultValue={user.phoneNumber || ""} type="text" className="input-hud" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-[0.62rem] font-black uppercase tracking-[0.24em] text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Address
              </label>
              <RegionSelect fieldName="address" defaultValue={user.address || ""} />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
            <Link href="/profile" className="action-button-secondary text-[11px]">
              <X className="h-4 w-4" />
              Cancel
            </Link>
            <button type="submit" className="action-button-primary text-[11px]">
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </form>
      </SurfaceCard>
    </PageShell>
  );
}
