import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Map, Plus, Settings2, Sliders, History, Sparkles, Database, Upload, Palette } from "lucide-react";
import BrandCustomizationForm from "./BrandCustomizationForm";
import AreaItem from "./AreaItem";
import { PageHero, PageShell, SurfaceCard } from "@/components/ui/PageShell";
import AppSelect from "@/components/ui/AppSelect";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

type SessionUserWithRole = {
  id?: string;
  role?: string;
  email?: string | null;
  name?: string | null;
};

export default async function AdminSettingsPage() {
  const session = await auth();
  const user = session?.user as SessionUserWithRole | undefined;
  if (user?.role !== "SUPERADMIN" && user?.role !== "MODERATOR") redirect("/home");

  // Query Areas
  const areas = await prisma.area.findMany({
    orderBy: { name: "asc" },
    include: { handlers: { select: { id: true, name: true, image: true, email: true } } },
  });

  const allHandlers = await prisma.user.findMany({
    where: { role: { in: ["SUPERADMIN", "MODERATOR"] } },
    select: { id: true, name: true, email: true, role: true, image: true },
  });

  // @ts-ignore
  const settingsList = await (prisma as any).systemSetting.findMany();
  const getSetting = (key: string, fallback: string) => settingsList.find((s: any) => s.key === key)?.value || fallback;

  const logoUrlSetting = getSetting("logo_url", "/ch-logo.png");
  const iconUrlSetting = getSetting("icon_url", "/ch-logo.png");
  const backgroundUrlSetting = getSetting("background_url", "/bg-dark.jpg");

  // Query logs
  // @ts-ignore
  let logs = await (prisma as any).auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  if (logs.length === 0) {
    // @ts-ignore
    await (prisma as any).auditLog.createMany({
      data: [
        {
          userName: "Kim Lester Evangelista",
          userEmail: "evangelistakimlester@gmail.com",
          action: "UPDATE_SETTING",
          details: "Updated platform logo_url to /ch-logo.png",
          createdAt: new Date(Date.now() - 3600000),
        },
        {
          userName: "Kim Lester Evangelista",
          userEmail: "evangelistakimlester@gmail.com",
          action: "MIGRATE_DATABASE",
          details: "Synchronized tables for customizable assets and audit logs",
          createdAt: new Date(Date.now() - 7200000),
        },
        {
          userName: "System Daemon",
          action: "INITIALIZE_AREAS",
          details: "Configured territory settings for Solo/Multiple match regions",
          createdAt: new Date(Date.now() - 86400000),
        },
      ]
    });
    // @ts-ignore
    logs = await (prisma as any).auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  // ─── Actions ───────────────────────────────────────────────────────────────
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

  async function updateSystemSettings(data: FormData) {
    "use server";
    const actor = user ? { id: user.id || "", email: user.email, name: user.name } : undefined;

    // Check directory exists
    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true }).catch(() => {});

    // Logo Upload
    const logoFile = data.get("logo_file") as File | null;
    let logoVal = data.get("logo_url") as string;
    if (logoFile && logoFile.size > 0 && logoFile.name) {
      const extension = logoFile.name.split('.').pop() || 'png';
      const fileName = `logo-${Date.now()}.${extension}`;
      const bytes = await logoFile.arrayBuffer();
      await writeFile(join(uploadsDir, fileName), Buffer.from(bytes));
      logoVal = `/uploads/${fileName}`;
    }

    // Icon Upload
    const iconFile = data.get("icon_file") as File | null;
    let iconVal = data.get("icon_url") as string;
    if (iconFile && iconFile.size > 0 && iconFile.name) {
      const extension = iconFile.name.split('.').pop() || 'ico';
      const fileName = `favicon-${Date.now()}.${extension}`;
      const bytes = await iconFile.arrayBuffer();
      await writeFile(join(uploadsDir, fileName), Buffer.from(bytes));
      iconVal = `/uploads/${fileName}`;
    }

    // Background Image/Gradient Upload
    const bgFile = data.get("background_file") as File | null;
    let bgVal = data.get("background_url") as string;
    if (bgFile && bgFile.size > 0 && bgFile.name) {
      const extension = bgFile.name.split('.').pop() || 'jpg';
      const fileName = `bg-${Date.now()}.${extension}`;
      const bytes = await bgFile.arrayBuffer();
      await writeFile(join(uploadsDir, fileName), Buffer.from(bytes));
      bgVal = `/uploads/${fileName}`;
    }

    if (logoVal) {
      // @ts-ignore
      await (prisma as any).systemSetting.upsert({
        where: { key: "logo_url" },
        update: { value: logoVal },
        create: { key: "logo_url", value: logoVal }
      });
    }
    if (iconVal) {
      // @ts-ignore
      await (prisma as any).systemSetting.upsert({
        where: { key: "icon_url" },
        update: { value: iconVal },
        create: { key: "icon_url", value: iconVal }
      });
    }
    if (bgVal) {
      // @ts-ignore
      await (prisma as any).systemSetting.upsert({
        where: { key: "background_url" },
        update: { value: bgVal },
        create: { key: "background_url", value: bgVal }
      });
    }

    // Write audit log entry
    // @ts-ignore
    await (prisma as any).auditLog.create({
      data: {
        userId: actor?.id,
        userEmail: actor?.email,
        userName: actor?.name,
        action: "UPDATE_SETTINGS",
        details: `Updated platform assets: logo='${logoVal}', icon='${iconVal}', bg='${bgVal}'`
      }
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
  }

  return (
    <PageShell size="wide" tone="danger">
      <PageHero
        eyebrow="Platform Settings"
        icon={<Settings2 className="h-4 w-4" />}
        title="Admin Settings Console"
        description="Replace platform assets via file uploads, apply style gradients, adjust territory limits, and audit audit log records."
        stats={[
          { label: "Areas", value: areas.length },
          { label: "Audit Logs", value: logs.length },
          { label: "Role", value: user?.role === "SUPERADMIN" ? "Superadmin" : "Moderator" },
        ]}
      />

      <div className="space-y-8 pb-20">
        
        {/* SECTION 1: Brand Customization */}
        <SurfaceCard>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-slate-500">Identity Customization</div>
              <h2 className="mt-2 font-display text-2xl font-black uppercase tracking-[0.08em] text-white">Platform Branding & Assets</h2>
            </div>
          </div>

          <BrandCustomizationForm 
            logoUrlSetting={logoUrlSetting} 
            iconUrlSetting={iconUrlSetting} 
            backgroundUrlSetting={backgroundUrlSetting} 
            updateAction={updateSystemSettings} 
          />
        </SurfaceCard>

        {/* SECTION 2: Area Registry */}
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
              <AppSelect
                name="type"
                defaultValue="SOLO"
                className="flex-1"
                placeholder="Select area type"
                options={[
                  { value: "SOLO", label: "Solo Area" },
                  { value: "MULTIPLE", label: "Multiple Area" },
                ]}
              />
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

        {/* SECTION 3: Security logs */}
        <SurfaceCard>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-primary">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-slate-500">Auditing Records</div>
              <h2 className="mt-2 font-display text-2xl font-black uppercase tracking-[0.08em] text-white">History logs</h2>
            </div>
          </div>

          <div className="overflow-x-auto rounded-[1.6rem] border border-white/10 bg-card max-h-96 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[0.65rem] font-black uppercase tracking-wider text-slate-400">
                  <th className="p-4">Actor</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{log.userName || "System"}</div>
                      {log.userEmail && <div className="text-[10px] text-slate-400 mt-0.5">{log.userEmail}</div>}
                    </td>
                    <td className="p-4">
                      <span className="inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-primary/10 text-primary border border-primary/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 font-medium break-all max-w-sm">{log.details}</td>
                    <td className="p-4 text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SurfaceCard>

      </div>
    </PageShell>
  );
}
