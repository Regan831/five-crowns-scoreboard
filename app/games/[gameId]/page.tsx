import Link from "next/link";
import { notFound } from "next/navigation";
import { completeGame } from "@/app/actions";
import prisma from "@/lib/prisma";
import RoundsTable from "./RoundsTable";
import CompleteGamePrompt from "./CompleteGamePrompt";

type GamePageProps = {
  params: { gameId: string } | Promise<{ gameId: string }>;
  searchParams?: { key?: string } | Promise<{ key?: string }>;
};

function formatDate(value?: Date | null) {
  if (!value) return "";
  return value.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function GamePage({ params, searchParams }: GamePageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  if (!resolvedParams?.gameId) {
    notFound();
  }

  const game = await prisma.game.findUnique({
    where: { id: resolvedParams.gameId },
    include: {
      players: {
        include: { player: true },
        orderBy: { seat: "asc" },
      },
      rounds: {
        include: {
          scores: { include: { player: true } },
          wentOutPlayer: true,
        },
        orderBy: { roundNumber: "asc" },
      },
    },
  });

  if (!game) {
    notFound();
  }

  const canEdit = resolvedSearchParams?.key === game.secretKey;
  const totals = new Map<string, number>();
  game.rounds.forEach((round) => {
    round.scores.forEach((score) => {
      const current = totals.get(score.playerId) ?? 0;
      totals.set(score.playerId, current + score.score);
    });
  });

  const winners = game.players.filter((player) => player.isWinner);
  const leaderboard = game.players
    .map((p) => ({
      name: p.player.name,
      total: totals.get(p.playerId) ?? 0,
      isWinner: p.isWinner,
    }))
    .sort((a, b) => a.total - b.total);
  const allRoundsScored = game.rounds.every(
    (round) => round.scores.length === game.players.length,
  );
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              5 Crowns
            </p>
            <h1 className="text-2xl font-semibold">
              {game.title || "Game"} · {formatDate(game.createdAt)}
            </h1>
            {!canEdit && (
              <p className="text-xs text-slate-500">
                View only. Append ?key=... to edit.
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full bg-slate-100 px-3 py-1">
              {game.status === "COMPLETED" ? "Completed" : "In progress"}
            </span>
            <Link
              href="/"
              className="text-slate-600 underline underline-offset-4 hover:text-slate-800"
            >
              New game
            </Link>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-5 shadow-sm">
            <div className="flex flex-col gap-3 text-base">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.name}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-500">
                      #{index + 1}
                    </span>
                    <span className="text-base font-semibold text-slate-900">
                      {entry.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="min-w-[2.5rem] text-right text-base font-semibold text-slate-900 tabular-nums">
                      {entry.total}
                    </span>
                    {entry.isWinner && (
                      <span className="rounded-full bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white">
                        Winner
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {game.status === "IN_PROGRESS" && canEdit && allRoundsScored && (
            <div className="mt-3 flex justify-end">
              <CompleteGamePrompt
                gameId={game.id}
                secretKey={game.secretKey}
                action={completeGame}
              />
            </div>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <RoundsTable
            rounds={game.rounds}
            players={game.players}
            gameId={game.id}
            secretKey={game.secretKey}
            canEdit={canEdit}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span>Rounds: {game.rounds.filter((r) => r.scores.length > 0).length}/11</span>
          {winners.length > 0 && (
            <span>Winner(s): {winners.map((w) => w.player.name).join(", ")}</span>
          )}
          {canEdit && (
            <span className="font-mono bg-slate-100 px-2 py-1 rounded">
              Key: {game.secretKey}
            </span>
          )}
        </div>
        {(game.status === "COMPLETED" || allRoundsScored) && (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {game.status === "COMPLETED"
                    ? "Winner!!"
                    : "Leaderboard preview"}
                </p>
                <p className="text-xs text-slate-500">
                  Lower score wins. Sorted by total.
                </p>
              </div>
              {game.status === "COMPLETED" && winners.length > 0 && (
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  {winners.map((w) => w.player.name).join(", ")}
                </span>
              )}
            </div>
            <ol className="mt-3 space-y-2 text-sm">
              {leaderboard.map((entry, index) => (
                <li
                  key={entry.name}
                  className="flex items-center justify-between rounded border border-slate-100 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">#{index + 1}</span>
                    <span className="font-semibold text-slate-900">
                      {entry.name}
                    </span>
                  </div>
                  <span className="text-slate-700">{entry.total}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </main>
  );
}
