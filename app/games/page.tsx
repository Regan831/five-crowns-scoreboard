import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  searchParams: Promise<{ status?: string | string[] }>;
};

function formatDateTime(value?: Date | null) {
  if (!value) return "—";
  return value.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function GamesIndex({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawStatus = Array.isArray(params.status)
    ? params.status[0]
    : params.status;
  const statusParam = rawStatus ?? "";
  const statusFilter =
    statusParam.toUpperCase() === "IN_PROGRESS" ? "IN_PROGRESS" : "COMPLETED";

  const games = await prisma.game.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      players: { include: { player: true } },
    },
  });

  type GameWithPlayers = (typeof games)[number];

  const filteredGames = games.filter(
    (game: GameWithPlayers) => game.status === statusFilter,
  );
  console.log(
    "[games/page] statusParam:",
    statusParam,
    "params:",
    params,
    "statusFilter:",
    statusFilter,
    "total:",
    games.length,
    "filtered:",
    filteredGames.length,
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Archive
          </p>
          <h1 className="text-3xl font-semibold">All games</h1>
          <p className="text-sm text-slate-600">
            Browse previous sessions and open any game to review round scores.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm">
            <Link
              href="/games?status=COMPLETED"
              className={`px-4 py-2 transition ${
                statusFilter === "COMPLETED"
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              Completed
            </Link>
            <Link
              href="/games?status=IN_PROGRESS"
              className={`px-4 py-2 transition ${
                statusFilter === "IN_PROGRESS"
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              In progress
            </Link>
          </div>
          <Link
            href="/"
            className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:bg-white hover:shadow-sm"
          >
            Start new game
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="border-b border-slate-200 px-4 py-3 font-semibold">
                Dates
              </th>
              <th className="border-b border-slate-200 px-4 py-3 font-semibold">
                Players
              </th>
              <th className="border-b border-slate-200 px-4 py-3 font-semibold">
                Winners
              </th>
              <th className="border-b border-slate-200 px-4 py-3 font-semibold">
                Status
              </th>
              <th className="border-b border-slate-200 px-4 py-3 font-semibold">
                Open
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredGames.map((game: GameWithPlayers) => {
              const winners = game.players
                .filter((gp: GameWithPlayers["players"][number]) => gp.isWinner)
                .map((gp: GameWithPlayers["players"][number]) => gp.player.name);
              return (
                <tr key={game.id} className="odd:bg-white even:bg-slate-50/60">
                  <td className="border-b border-slate-200 px-4 py-3 text-slate-700">
                    <div>Started: {formatDateTime(game.createdAt)}</div>
                    <div>
                      Completed: {game.completedAt ? formatDateTime(game.completedAt) : "—"}
                    </div>
                  </td>
                  <td className="border-b border-slate-200 px-4 py-3 text-slate-700">
                    {game.players
                      .map((gp: GameWithPlayers["players"][number]) => gp.player.name)
                      .join(", ")}
                  </td>
                  <td className="border-b border-slate-200 px-4 py-3 text-slate-700">
                    {winners.length ? winners.join(", ") : "—"}
                  </td>
                  <td className="border-b border-slate-200 px-4 py-3 text-slate-700">
                    {game.status === "COMPLETED" ? "Completed" : "In progress"}
                  </td>
                  <td className="border-b border-slate-200 px-4 py-3">
                    <Link
                      href={`/games/${game.id}`}
                      className="text-sm font-semibold text-slate-900 underline underline-offset-4"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredGames.length === 0 && (
          <div className="p-6 text-sm text-slate-600">No games yet.</div>
        )}
      </div>
    </div>
  );
}
