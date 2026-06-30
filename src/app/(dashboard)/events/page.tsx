import { prisma } from "@/lib/prisma";
import EventsClient, { type EventCard } from "./EventsClient";

export default async function EventsPage() {
  const tournaments = await prisma.tournament.findMany({
    include: {
      _count: {
        select: { participants: true },
      },
    },
    orderBy: {
      startDate: "desc",
    },
  });

  const colors = [
    "from-slate-500/20 to-zinc-500/10",
    "from-amber-500/20 to-orange-500/10",
    "from-fuchsia-500/20 to-violet-500/10",
    "from-emerald-500/20 to-teal-500/10",
  ];

  const mappedEvents: EventCard[] = tournaments.map((t, idx) => {
    let status: "Ongoing" | "Upcoming" | "Completed" = "Upcoming";
    if (t.status === "ONGOING") {
      status = "Ongoing";
    } else if (t.status === "COMPLETED") {
      status = "Completed";
    } else {
      status = "Upcoming";
    }

    const startDateStr = t.startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const endDateStr = t.endDate
      ? t.endDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "TBA";

    return {
      id: t.id,
      status,
      color: colors[idx % colors.length],
      name: t.title,
      dates: `${startDateStr} - ${endDateStr}`,
      tournamentsCount: 1,
      playersCount: t._count.participants,
    };
  });

  return <EventsClient initialEvents={mappedEvents} />;
}
