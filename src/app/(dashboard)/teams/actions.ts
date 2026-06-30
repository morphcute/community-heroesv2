"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function sendMessage(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) return;

  const content = formData.get("content") as string;
  const teamId = formData.get("teamId") as string;

  if (!content || !teamId) return;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return;

  await prisma.message.create({
    data: {
      content,
      teamId,
      userId: user.id,
    },
  });

  revalidatePath(`/teams/${teamId}`);
}

export async function createTeam(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  if (!name) throw new Error("Name is required");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { teamMembers: true }
  });

  if (!user) throw new Error("User not found");
  
  if (!user.mlbbId || !user.server) {
    throw new Error("Profile Incomplete: You must set your MLBB ID and Server in your Profile before creating a team.");
  }
  
  if (user.teamMembers.length > 0) {
    throw new Error("You are already in a team");
  }

  // Create Team and add user as Captain
  const team = await prisma.team.create({
    data: {
      name,
      description,
      captainId: user.id,
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=256`, // Placeholder logo
      members: {
        create: {
          userId: user.id,
          role: 'CAPTAIN',
          status: 'APPROVED'
        }
      }
    }
  });

  revalidatePath('/teams');
  redirect(`/teams/${team.id}`);
}

export async function joinTeam(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const teamId = formData.get('teamId') as string;
  if (!teamId) throw new Error("Team ID required");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { teamMembers: true }
  });

  if (!user) throw new Error("User not found");

  if (!user.mlbbId || !user.server) {
    throw new Error("Profile Incomplete: You must set your MLBB ID and Server in your Profile before joining a team.");
  }

  if (user.teamMembers.length > 0) {
    throw new Error("You are already in a team");
  }

  // Check if team is full (max 5)
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { _count: { select: { members: { where: { status: 'APPROVED' } } } } }
  });

  if (!team) throw new Error("Team not found");
  if (team._count.members >= 5) throw new Error("Team is full");

  await prisma.teamMember.create({
    data: {
      teamId,
      userId: user.id,
      role: 'MEMBER',
      status: 'PENDING'
    }
  });

  revalidatePath(`/teams/${teamId}`);
  revalidatePath('/teams');
}

export async function leaveTeam(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const teamId = formData.get('teamId') as string;
  if (!teamId) throw new Error("Team ID required");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) throw new Error("User not found");

  // If captain leaves, delete team (simple logic for now)
  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId: user.id
      }
    }
  });

  if (membership?.role === 'CAPTAIN') {
    await prisma.team.delete({ where: { id: teamId } });
  } else {
    await prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId: user.id
        }
      }
    });
  }

  revalidatePath(`/teams/${teamId}`);
  revalidatePath('/teams');
}

export async function approveMember(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const membershipId = formData.get('membershipId') as string;
  const teamId = formData.get('teamId') as string;

  if (!membershipId || !teamId) throw new Error("Missing required fields");

  // Verify requester is captain
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  const captainMembership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: user.id } }
  });

  if (!captainMembership || captainMembership.role !== 'CAPTAIN') {
    throw new Error("Only captains can approve members");
  }

  await prisma.teamMember.update({
    where: { id: membershipId },
    data: { status: 'APPROVED' }
  });

  revalidatePath(`/teams/${teamId}`);
}

export async function rejectMember(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const membershipId = formData.get('membershipId') as string;
  const teamId = formData.get('teamId') as string;

  if (!membershipId || !teamId) throw new Error("Missing required fields");

  // Verify requester is captain
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  const captainMembership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: user.id } }
  });

  if (!captainMembership || captainMembership.role !== 'CAPTAIN') {
    throw new Error("Only captains can reject members");
  }

  await prisma.teamMember.delete({
    where: { id: membershipId }
  });

  revalidatePath(`/teams/${teamId}`);
}

export async function updateRoles(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const roles = formData.getAll('roles') as string[];
  
  // Validate roles against enum
  const validRoles = ['TANK_SUPPORT', 'FIGHTER', 'JUNGLER', 'MAGE', 'MARKSMAN'];
  const filteredRoles = roles.filter(role => validRoles.includes(role));

  // @ts-ignore - Prisma enum type mismatch with string array
  await prisma.user.update({
    where: { email: session.user.email },
    // @ts-ignore
    data: { roles: filteredRoles }
  });

  revalidatePath('/teams/my-team');
}

async function getCurrentCaptainUser() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      teamMembers: {
        where: {
          status: "APPROVED",
          role: "CAPTAIN",
        },
      },
    },
  });

  if (!user) throw new Error("User not found");
  return user;
}

export async function postScrim(formData: FormData) {
  const notes = (formData.get("notes") as string | null)?.trim() || null;
  const scheduledAtInput = (formData.get("scheduledAt") as string | null)?.trim() || null;
  const user = await getCurrentCaptainUser();
  const captainMembership = user.teamMembers[0];

  if (!captainMembership) throw new Error("Only team captains can post scrims");

  const existingOpenScrim = await prisma.scrim.findFirst({
    where: {
      hostTeamId: captainMembership.teamId,
      status: { in: ["OPEN", "PENDING", "ACCEPTED"] },
    },
  });

  if (existingOpenScrim) {
    throw new Error("Your team already has an active scrim post");
  }

  await prisma.scrim.create({
    data: {
      hostTeamId: captainMembership.teamId,
      hostedByUserId: user.id,
      notes,
      scheduledAt: scheduledAtInput ? new Date(scheduledAtInput) : null,
    },
  });

  revalidatePath("/scrims");
  revalidatePath(`/teams/${captainMembership.teamId}`);
}

export async function requestScrim(formData: FormData) {
  const scrimId = formData.get("scrimId") as string;
  if (!scrimId) throw new Error("Missing scrim");

  const user = await getCurrentCaptainUser();
  const captainMembership = user.teamMembers[0];

  if (!captainMembership) throw new Error("Only team captains can request scrims");

  const scrim = await prisma.scrim.findUnique({
    where: { id: scrimId },
  });

  if (!scrim) throw new Error("Scrim not found");
  if (scrim.status !== "OPEN") throw new Error("This scrim is no longer open for requests");
  if (scrim.hostTeamId === captainMembership.teamId) {
    throw new Error("You cannot request your own scrim post");
  }

  const conflictingScrim = await prisma.scrim.findFirst({
    where: {
      status: { in: ["PENDING", "ACCEPTED"] },
      OR: [
        { hostTeamId: scrim.hostTeamId, guestTeamId: captainMembership.teamId },
        { hostTeamId: captainMembership.teamId, guestTeamId: scrim.hostTeamId },
      ],
    },
  });

  if (conflictingScrim) {
    throw new Error("There is already an active scrimmage between these teams");
  }

  await prisma.scrim.update({
    where: { id: scrimId },
    data: {
      guestTeamId: captainMembership.teamId,
      requestedByUserId: user.id,
      status: "PENDING",
    },
  });

  revalidatePath("/scrims");
  revalidatePath(`/teams/${scrim.hostTeamId}`);
  revalidatePath(`/teams/${captainMembership.teamId}`);
}

export async function acceptScrim(formData: FormData) {
  const scrimId = formData.get("scrimId") as string;
  if (!scrimId) throw new Error("Missing scrim");

  const user = await getCurrentCaptainUser();

  const scrim = await prisma.scrim.findUnique({
    where: { id: scrimId },
  });

  if (!scrim) throw new Error("Scrim not found");
  if (scrim.status !== "PENDING" || !scrim.guestTeamId) {
    throw new Error("Only pending scrim requests can be accepted");
  }

  const canManage = user.teamMembers.some((membership) => membership.teamId === scrim.hostTeamId);
  if (!canManage) throw new Error("Only the host team's captain can accept this scrim");

  await prisma.scrim.update({
    where: { id: scrimId },
    data: {
      status: "ACCEPTED",
      acceptedAt: new Date(),
    },
  });

  revalidatePath("/scrims");
  revalidatePath(`/teams/${scrim.hostTeamId}`);
  if (scrim.guestTeamId) {
    revalidatePath(`/teams/${scrim.guestTeamId}`);
  }
}

export async function rejectScrim(formData: FormData) {
  const scrimId = formData.get("scrimId") as string;
  if (!scrimId) throw new Error("Missing scrim");

  const user = await getCurrentCaptainUser();

  const scrim = await prisma.scrim.findUnique({
    where: { id: scrimId },
  });

  if (!scrim) throw new Error("Scrim not found");
  if (scrim.status !== "PENDING") throw new Error("Only pending requests can be rejected");

  const canManage = user.teamMembers.some((membership) => membership.teamId === scrim.hostTeamId);
  if (!canManage) throw new Error("Only the host team's captain can reject this scrim");

  await prisma.scrim.update({
    where: { id: scrimId },
    data: {
      status: "OPEN",
      guestTeamId: null,
      requestedByUserId: null,
      acceptedAt: null,
    },
  });

  revalidatePath("/scrims");
  revalidatePath(`/teams/${scrim.hostTeamId}`);
}

export async function withdrawScrimRequest(formData: FormData) {
  const scrimId = formData.get("scrimId") as string;
  if (!scrimId) throw new Error("Missing scrim");

  const user = await getCurrentCaptainUser();

  const scrim = await prisma.scrim.findUnique({
    where: { id: scrimId },
  });

  if (!scrim) throw new Error("Scrim not found");
  if (scrim.status !== "PENDING" || !scrim.guestTeamId) {
    throw new Error("Only pending requests can be withdrawn");
  }

  const canManage = user.teamMembers.some((membership) => membership.teamId === scrim.guestTeamId);
  if (!canManage) throw new Error("Only the requesting team's captain can withdraw this scrim");

  await prisma.scrim.update({
    where: { id: scrimId },
    data: {
      status: "OPEN",
      guestTeamId: null,
      requestedByUserId: null,
      acceptedAt: null,
    },
  });

  revalidatePath("/scrims");
  revalidatePath(`/teams/${scrim.hostTeamId}`);
}

export async function cancelScrim(formData: FormData) {
  const scrimId = formData.get("scrimId") as string;
  if (!scrimId) throw new Error("Missing scrim");

  const user = await getCurrentCaptainUser();

  const scrim = await prisma.scrim.findUnique({
    where: { id: scrimId },
  });

  if (!scrim) throw new Error("Scrim not found");

  const canManage = user.teamMembers.some((membership) => membership.teamId === scrim.hostTeamId);
  if (!canManage) throw new Error("Only the host team's captain can cancel this scrim");

  await prisma.scrim.update({
    where: { id: scrimId },
    data: { status: "CANCELED" },
  });

  revalidatePath("/scrims");
  revalidatePath(`/teams/${scrim.hostTeamId}`);
  if (scrim.guestTeamId) {
    revalidatePath(`/teams/${scrim.guestTeamId}`);
  }
}

export async function reportScrimResult(formData: FormData) {
  const scrimId = formData.get("scrimId") as string;
  const hostScore = Number(formData.get("hostScore"));
  const guestScore = Number(formData.get("guestScore"));

  if (!scrimId) throw new Error("Missing scrim");
  if (Number.isNaN(hostScore) || Number.isNaN(guestScore)) {
    throw new Error("Scores are required");
  }
  if (hostScore === guestScore) {
    throw new Error("Scrimmage results cannot end in a draw");
  }

  const user = await getCurrentCaptainUser();

  const scrim = await prisma.scrim.findUnique({
    where: { id: scrimId },
  });

  if (!scrim) throw new Error("Scrim not found");
  if (scrim.status !== "ACCEPTED") throw new Error("Only accepted scrims can be completed");

  const canManage = user.teamMembers.some((membership) => membership.teamId === scrim.hostTeamId);
  if (!canManage) throw new Error("Only the host team's captain can report this scrim result");

  const winnerTeamId =
    hostScore > guestScore ? scrim.hostTeamId : scrim.guestTeamId;

  if (!winnerTeamId) throw new Error("The guest team is missing for this scrim");

  await prisma.scrim.update({
    where: { id: scrimId },
    data: {
      status: "COMPLETED",
      hostScore,
      guestScore,
      winnerTeamId,
      completedAt: new Date(),
    },
  });

  revalidatePath("/scrims");
  revalidatePath(`/teams/${scrim.hostTeamId}`);
  if (scrim.guestTeamId) {
    revalidatePath(`/teams/${scrim.guestTeamId}`);
  }
}

export async function kickMember(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const membershipId = formData.get("membershipId") as string;
  const teamId = formData.get("teamId") as string;

  if (!membershipId || !teamId) throw new Error("Missing fields");

  const user = await getCurrentCaptainUser();
  const captainMembership = user.teamMembers.find((m) => m.teamId === teamId);
  if (!captainMembership) throw new Error("Only team captains can kick members");

  const memberToKick = await prisma.teamMember.findUnique({
    where: { id: membershipId },
  });

  if (!memberToKick) throw new Error("Member not found");
  if (memberToKick.teamId !== teamId) throw new Error("Member belongs to different team");
  if (memberToKick.role === "CAPTAIN") throw new Error("Cannot kick the captain");

  await prisma.teamMember.delete({
    where: { id: membershipId },
  });

  revalidatePath(`/teams/${teamId}`);
}

export async function inviteMember(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const targetUserId = formData.get("userId") as string;
  const teamId = formData.get("teamId") as string;

  if (!targetUserId || !teamId) throw new Error("Missing fields");

  const user = await getCurrentCaptainUser();
  const captainMembership = user.teamMembers.find((m) => m.teamId === teamId);
  if (!captainMembership) throw new Error("Only team captains can invite members");

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { _count: { select: { members: { where: { status: "APPROVED" } } } } },
  });

  if (!team) throw new Error("Team not found");
  if (team._count.members >= 5) throw new Error("Team is full");

  const existingTeam = await prisma.teamMember.findFirst({
    where: { userId: targetUserId, status: "APPROVED" },
  });

  if (existingTeam) throw new Error("User is already in a team");

  await prisma.teamMember.create({
    data: {
      teamId,
      userId: targetUserId,
      role: "MEMBER",
      status: "INVITED",
    },
  });

  revalidatePath(`/teams/${teamId}`);
  revalidatePath(`/teams/${teamId}/recruit`);
}

export async function acceptInvite(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const membershipId = formData.get("membershipId") as string;
  if (!membershipId) throw new Error("Missing fields");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) throw new Error("User not found");

  const membership = await prisma.teamMember.findUnique({
    where: { id: membershipId },
  });

  if (!membership || membership.userId !== user.id || membership.status !== "INVITED") {
    throw new Error("Valid invitation not found");
  }

  const team = await prisma.team.findUnique({
    where: { id: membership.teamId },
    include: { _count: { select: { members: { where: { status: "APPROVED" } } } } },
  });

  if (!team) throw new Error("Team not found");
  if (team._count.members >= 5) throw new Error("Team is full");

  await prisma.teamMember.update({
    where: { id: membershipId },
    data: { status: "APPROVED" },
  });

  revalidatePath(`/teams/${membership.teamId}`);
  revalidatePath(`/teams/my-team`);
}

export async function declineInvite(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const membershipId = formData.get("membershipId") as string;
  if (!membershipId) throw new Error("Missing fields");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) throw new Error("User not found");

  const membership = await prisma.teamMember.findUnique({
    where: { id: membershipId },
  });

  if (!membership || membership.userId !== user.id) {
    throw new Error("Valid invitation not found");
  }

  await prisma.teamMember.delete({
    where: { id: membershipId },
  });

  revalidatePath(`/teams/${membership.teamId}`);
  revalidatePath(`/teams/my-team`);
}
