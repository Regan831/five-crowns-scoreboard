"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { saveRoundScores } from "@/app/actions";

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
  round: RoundView;
  players: PlayerView[];
  gameId: string;
  secretKey: string;
  canEdit: boolean;
  isEditable: boolean;
  onEdit: (roundId: string) => void;
  onAfterSave: () => void;
};

export default function RoundRow({
  round,
  players,
  gameId,
  secretKey,
  canEdit,
  isEditable,
  onEdit,
  onAfterSave,
}: Props) {
  const formId = useMemo(() => `round-form-${round.id}`, [round.id]);
  const [wentOutId, setWentOutId] = useState<string>(
    round.wentOutPlayerId ?? "",
  );
   const [isEditing, setIsEditing] = useState<boolean>(isEditable);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    setIsEditing(isEditable);
  }, [isEditable]);

  const savedScore = (playerId: string) =>
    round.scores.find((score) => score.playerId === playerId);

  const handleWentOutChange = (value: string) => {
    setWentOutId(value);
    if (!value) return;
    const ref = inputRefs.current[value];
    if (ref) {
      ref.value = "0";
    }
  };

  const active = canEdit && (isEditable || isEditing);

  return (
    <tr key={round.id} className="odd:bg-white even:bg-slate-50/50">
      <td className="border-b border-slate-200 px-3 py-2 font-semibold">
        {round.roundNumber}
      </td>
      <td className="border-b border-slate-200 px-3 py-2">
        {active ? (
          <select
            name="wentOutPlayerId"
            defaultValue={wentOutId}
            form={formId}
            onChange={(event) => handleWentOutChange(event.target.value)}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm outline-none focus:border-slate-500"
          >
            <option value="">Select</option>
            {players.map((p) => (
              <option key={p.id} value={p.playerId}>
                {p.player.name}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-slate-800">
            {round.wentOutPlayer?.name ?? "—"}
          </span>
        )}
      </td>
      {players.map((p) => {
        const saved = savedScore(p.playerId);
        return (
          <td key={round.id + p.id} className="border-b border-slate-200 px-3 py-2">
            {active ? (
              <input
                ref={(node) => {
                  inputRefs.current[p.playerId] = node;
                }}
                type="number"
                name={`score-${p.playerId}`}
                defaultValue={saved?.score ?? ""}
                min={0}
                form={formId}
                className="w-20 rounded border border-slate-300 bg-white px-2 py-1 text-sm outline-none focus:border-slate-500"
              />
            ) : (
              <span className="text-slate-800">{saved?.score ?? "—"}</span>
            )}
          </td>
        );
      })}
      {canEdit && (
        <td className="border-b border-slate-200 px-3 py-2">
          {active ? (
            <form
              id={formId}
              className="flex items-center gap-2"
              action={saveRoundScores}
              onSubmit={() => {
                setIsEditing(false);
                onAfterSave();
              }}
            >
              <input type="hidden" name="gameId" value={gameId} />
              <input type="hidden" name="roundId" value={round.id} />
              <input type="hidden" name="secretKey" value={secretKey} />
              <button
                type="submit"
                className="rounded bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Save
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                onEdit(round.id);
                setIsEditing(true);
              }}
              className="text-xs text-slate-500 underline underline-offset-4 hover:text-slate-800"
            >
              Edit
            </button>
          )}
        </td>
      )}
    </tr>
  );
}
