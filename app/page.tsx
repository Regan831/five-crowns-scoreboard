import prisma from "@/lib/prisma";
import { createGame } from "./actions";
import PlayerSelector from "./PlayerSelector";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const existingPlayers = await prisma.player.findMany({
    orderBy: { name: "asc" },
    include: {
      gamePlayers: { select: { isWinner: true, game: { select: { status: true } } } },
    },
  });

  type ExistingPlayer = (typeof existingPlayers)[number];

  const existingWithWins = existingPlayers.map((p: ExistingPlayer) => {
    const wins = p.gamePlayers.filter(
      (gp: ExistingPlayer["gamePlayers"][number]) => gp.isWinner,
    ).length;
    return { id: p.id, name: p.name, wins };
  });

  const allPlayers = [...existingWithWins].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.name.localeCompare(b.name);
  });

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-14">
        <header className="space-y-3 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">Start a game</h1>
          <p className="text-sm text-slate-600">
            Pick 2–7 players. Choose from existing or add new names as you type.
          </p>
        </header>

        <form
          action={createGame}
          className="space-y-6 rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-xl shadow-slate-200 backdrop-blur"
        >
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-800">
              Players
            </p>
            <PlayerSelector players={allPlayers} />
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Start game
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
