import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PlayerRow = {
  name: string;
  games: number;
  wins: number;
  winRate: number;
  avgScore: number | null;
  highScore: number | null;
  lowScore: number | null;
  highestRound: number | null;
};

export default async function PlayersPage() {
  const players = await prisma.player.findMany({
    orderBy: { name: "asc" },
    include: {
      gamePlayers: {
        include: { game: { select: { status: true } } },
      },
      roundScores: true,
    },
  });

  type PlayerWithStats = (typeof players)[number];

  const rows: PlayerRow[] = players.map((player: PlayerWithStats) => {
    const completedGames = player.gamePlayers.filter(
      (gp: PlayerWithStats["gamePlayers"][number]) =>
        gp.game.status === "COMPLETED",
    );
    const games = completedGames.length;
    const wins = completedGames.filter(
      (gp: PlayerWithStats["gamePlayers"][number]) => gp.isWinner,
    ).length;
    const winRate = games > 0 ? Math.round((wins / games) * 100) : 0;
    const finals = completedGames
      .map((gp: PlayerWithStats["gamePlayers"][number]) => gp.finalTotal)
      .filter(
        (val: PlayerWithStats["gamePlayers"][number]["finalTotal"]): val is number =>
          val !== null && val !== undefined,
      );
    const avgScore =
      finals.length > 0
        ? Math.round(
            finals.reduce(
              (sum: number, val: number) => sum + val,
              0,
            ) / finals.length,
          )
        : null;
    const highScore = finals.length > 0 ? Math.max(...finals) : null;
    const lowScore = finals.length > 0 ? Math.min(...finals) : null;
    const highestRound =
      player.roundScores.length > 0
        ? Math.max(
            ...player.roundScores.map(
              (r: PlayerWithStats["roundScores"][number]) => r.score,
            ),
          )
        : null;

    return {
      name: player.name,
      games,
      wins,
      winRate,
      avgScore,
      highScore,
      lowScore,
      highestRound,
    };
  });

  return (
    <main className="min-h-screen text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Player stats</h1>
            <p className="text-sm text-slate-600">
              Games played, wins, averages, and top single-round scores.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="border-b border-slate-200 px-3 py-2 font-semibold">
                  Player
                </th>
                <th className="border-b border-slate-200 px-3 py-2 font-semibold">
                  Games
                </th>
                <th className="border-b border-slate-200 px-3 py-2 font-semibold">
                  Wins
                </th>
                <th className="border-b border-slate-200 px-3 py-2 font-semibold">
                  Win rate
                </th>
                <th className="border-b border-slate-200 px-3 py-2 font-semibold">
                  Avg score
                </th>
                <th className="border-b border-slate-200 px-3 py-2 font-semibold">
                  High score
                </th>
                <th className="border-b border-slate-200 px-3 py-2 font-semibold">
                  Low score
                </th>
                <th className="border-b border-slate-200 px-3 py-2 font-semibold">
                  Highest round
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name} className="odd:bg-white even:bg-slate-50/60">
                  <td className="border-b border-slate-200 px-3 py-2 font-semibold">
                    {row.name}
                  </td>
                  <td className="border-b border-slate-200 px-3 py-2 text-slate-700">
                    {row.games}
                  </td>
                  <td className="border-b border-slate-200 px-3 py-2 text-slate-700">
                    {row.wins}
                  </td>
                  <td className="border-b border-slate-200 px-3 py-2 text-slate-700">
                    {row.winRate}%
                  </td>
                  <td className="border-b border-slate-200 px-3 py-2 text-slate-700">
                    {row.avgScore ?? "—"}
                  </td>
                  <td className="border-b border-slate-200 px-3 py-2 text-slate-700">
                    {row.highScore ?? "—"}
                  </td>
                  <td className="border-b border-slate-200 px-3 py-2 text-slate-700">
                    {row.lowScore ?? "—"}
                  </td>
                  <td className="border-b border-slate-200 px-3 py-2 text-slate-700">
                    {row.highestRound ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="p-6 text-sm text-slate-600">No players yet.</div>
          )}
        </div>
      </div>
    </main>
  );
}
