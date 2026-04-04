import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Map, Plus, Settings2 } from "lucide-react";
import AreaItem from "./AreaItem";
import { PageHero, PageShell, SurfaceCard } from "@/components/ui/PageShell";

type SessionUserWithRole = {
  role?: string;
};

export default async function AdminSettingsPage() {
  const session = await auth();
  const role = (session?.user as SessionUserWithRole | undefined)?.role;
  if (role !== "SUPERADMIN") redirect("/");

  const areas = await prisma.area.findMany({
    orderBy: { name: "asc" },
    include: { handlers: { select: { id: true, name: true, image: true, email: true } } },
  });
  const allHandlers = await prisma.user.findMany({
    where: { role: { in: ["SUPERADMIN", "MODERATOR"] } },
    select: { id: true, name: true, email: true, role: true, image: true },
  });

  async function createArea(data: FormData) {
    "use server";
    const name = data.get("name") as string;
    const type = (data.get("type") as string) || "SOLO";
    const rawCovered = data.get("coveredLocations") as string;
    const coveredLocations = rawCovered ? rawCovered.split(",").map((segment) => segment.trim()).filter(Boolean) : [];
    if (name.trim()) {
      await prisma.area.create({ data: { name: name.trim(), type, coveredLocations } }).catch(() => {});
      revalidatePath("/admin/settings");
    }
  }

  async function updateArea(data: FormData) {
    "use server";
    const id = data.get("id") as string;
    const name = data.get("name") as string;
    const type = data.get("type") as string;
    const rawCovered = data.get("coveredLocations") as string;
    const coveredLocations = rawCovered ? rawCovered.split(",").map((segment) => segment.trim()).filter(Boolean) : [];
    const handlerIds = data.getAll("handlerIds") as string[];

    if (id && name.trim()) {
      await prisma.area
        .update({
          where: { id },
          data: {
            name: name.trim(),
            type,
            coveredLocations,
            handlers: {
              set: handlerIds.map((handlerId) => ({ id: handlerId })),
            },
          },
        })
        .catch(() => {});
      revalidatePath("/admin/settings");
    }
  }

  async function deleteArea(data: FormData) {
    "use server";
    const id = data.get("id") as string;
    await prisma.area.delete({ where: { id } }).catch(() => {});
    revalidatePath("/admin/settings");
  }

  return (
    <PageShell size="wide" tone="danger">
      <PageHero
        eyebrow="Platform Settings"
        icon={<Settings2 className="h-4 w-4" />}
        title="Configure territory coverage"
        description="Manage geographic boundaries and moderator ownership using the refreshed admin design system."
        stats={[
          { label: "Areas", value: areas.length },
          { label: "Handlers", value: allHandlers.length },
          { label: "Access", value: "Superadmin" },
        ]}
      />

      <SurfaceCard>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-primary">
            <Map className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-slate-500">Area Registry</div>
            <h2 className="mt-2 font-display text-2xl font-black uppercase tracking-[0.08em] text-white">Administrative territories</h2>
          </div>
        </div>

        <form action={createArea} className="mb-6 grid grid-cols-1 gap-3 rounded-[1.6rem] border border-white/10 bg-white/5 p-4 md:grid-cols-4">
          <input name="name" required placeholder="Area name" className="input-hud" />
          <input name="coveredLocations" placeholder="Covered provinces or cities" className="input-hud md:col-span-2" />
          <div className="flex gap-3">
            <select name="type" className="input-hud flex-1 appearance-none">
              <option value="SOLO">Solo Area</option>
              <option value="MULTIPLE">Multiple Area</option>
            </select>
            <button type="submit" className="action-button-primary whitespace-nowrap text-[11px]">
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {areas.map((area) => (
            <AreaItem key={area.id} area={area} allHandlers={allHandlers} updateAction={updateArea} deleteAction={deleteArea} />
          ))}
        </div>
      </SurfaceCard>
    </PageShell>
  );
}
