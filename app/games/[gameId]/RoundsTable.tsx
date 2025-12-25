"use client";

import { useEffect, useMemo, useState } from "react";
import RoundRow from "./RoundRow";

type PlayerView = {
  id: string;
  playerId: string;
  player: { name: string };
};

type RoundView = {
  id: string;
  roundNumber: number;
  wentOutPlayerId: string | null;
  wentOutPlayer: { name: string } | null;
  scores: { playerId: string; score: number; wentOut: boolean }[];
};

type Props = {
  rounds: RoundView[];
  players: PlayerView[];
  gameId: string;
  secretKey: string;
  canEdit: boolean;
};

export default function RoundsTable({
  rounds,
  players,
  gameId,
  secretKey,
  canEdit,
}: Props) {
  const defaultEditable = useMemo(() => {
    const firstUnscored = rounds.find(
      (round) => round.scores.length < players.length,
    );
    return firstUnscored?.id;
  }, [rounds, players.length]);

  const [activeRoundId, setActiveRoundId] = useState<string | undefined>(
    defaultEditable,
  );

  useEffect(() => {
    setActiveRoundId(defaultEditable);
  }, [defaultEditable]);

  return (
    <table className="w-full border-collapse text-sm">
      <thead className="bg-slate-50 text-left">
        <tr>
          <th className="border-b border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide">
            Round
          </th>
          <th className="border-b border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide">
            Went out
          </th>
          {players.map((p) => (
            <th
              key={p.id}
              className="border-b border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide"
            >
              {p.player.name}
            </th>
          ))}
          {canEdit && (
            <th className="border-b border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide">
              Action
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {rounds.map((round) => (
          <RoundRow
            key={round.id}
            round={round}
            players={players}
            gameId={gameId}
            secretKey={secretKey}
            canEdit={canEdit}
            isEditable={canEdit && round.id === activeRoundId}
            onEdit={(roundId) => setActiveRoundId(roundId)}
            onAfterSave={() => setActiveRoundId(undefined)}
          />
        ))}
      </tbody>
    </table>
  );
}
