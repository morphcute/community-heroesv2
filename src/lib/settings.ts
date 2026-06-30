import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSystemSetting(key: string, defaultValue: string): Promise<string> {
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key } });
    return setting?.value || defaultValue;
  } catch {
    return defaultValue;
  }
}

export async function setSystemSetting(
  key: string,
  value: string,
  actor?: { id: string; email?: string | null; name?: string | null }
) {
  try {
    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    // Write to audit log
    await prisma.auditLog.create({
      data: {
        userId: actor?.id,
        userEmail: actor?.email,
        userName: actor?.name,
        action: "UPDATE_SETTING",
        details: `Updated setting '${key}' to: '${value}'`,
      },
    });

    revalidatePath("/", "layout");
    return setting;
  } catch (error) {
    console.error(`Failed to set setting ${key}:`, error);
    throw error;
  }
}

export async function writeAuditLog(
  action: string,
  details: string,
  actor?: { id: string; email?: string | null; name?: string | null }
) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: actor?.id,
        userEmail: actor?.email,
        userName: actor?.name,
        action,
        details,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
